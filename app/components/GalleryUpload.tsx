import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    Image,
    Modal,
    ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { saveData, uploadImageToStorage } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";

// Loading overlay component
const LoaderOverlay = ({ message = "Processing..." }) => (
    <View style={styles.loaderOverlay}>
        <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#32CD32" />
            <Text style={styles.loaderText}>{message}</Text>
        </View>
    </View>
);

export default function GalleryUpload() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [plantName, setPlantName] = useState('');
    const [diseaseResult, setDiseaseResult] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Loading states
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Processing...");

    const { user } = useGlobalContext();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access gallery is required!');
            return;
        }

        // Option 1: No editing, direct selection
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // No edit/crop screen
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            // Show the image first before starting analysis
            uploadPicture(result.assets[0].uri);
        }
    };

    // Alternative function with edit option if needed
    const pickImageWithEdit = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access gallery is required!');
            return;
        }

        // Show info about the crop screen first
        Alert.alert(
            'Image Cropping',
            'You will see a crop screen next. Tap "Done" or "Use" after cropping to proceed.',
            [{ text: 'OK', onPress: async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true, // Shows the crop/edit screen
                        quality: 1,
                        aspect: [4, 3], // Optional: maintain aspect ratio
                        exif: false
                    });

                    if (!result.canceled) {
                        setImageUri(result.assets[0].uri);
                        // Show the image first before starting analysis
                        uploadPicture(result.assets[0].uri);
                    }
                }}]
        );
    };

    async function uploadPicture(uri: string) {
        try {
            setIsUploading(true);
            setLoadingMessage("Analyzing image...");

            const formData = new FormData();
            const filename = uri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('file', {
                uri: uri,
                name: filename,
                type: type,
            } as any);

            console.log('Uploading to server...');
            const response = await fetch('fill with your cloud api', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Server response:', result);

            setDiseaseResult(result);
            setModalVisible(true);  // Open the modal to ask for plant name

        } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert(
                'Upload Failed',
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        } finally {
            setIsUploading(false);
        }
    }

    async function handleSaveData() {
        if (!plantName.trim()) {
            Alert.alert('Error', 'Please enter a plant name!');
            return;
        }

        try {
            if (!imageUri) {
                Alert.alert('Error', 'No image to upload.');
                return;
            }

            setIsSaving(true);
            setLoadingMessage("Uploading to storage...");

            const file = await uploadImageToStorage(imageUri);
            console.log('File uploaded:', file);

            setLoadingMessage("Saving plant data...");
            await saveData(file, user!.email, plantName, diseaseResult);

            console.log('Saved to Appwrite');
            Alert.alert('Success', 'Plant and Disease saved successfully!');

            setModalVisible(false);
            router.push("/");
        } catch (error) {
            console.error('Saving failed:', error);
            Alert.alert(
                'Saving Failed',
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        } finally {
            setIsSaving(false);
        }
    }

    const resetImage = () => {
        setImageUri(null);
        setDiseaseResult(null);
        setPlantName('');
    };

    return (
        <View style={styles.container}>
            {imageUri ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={resetImage}
                            disabled={isUploading}
                        >
                            <MaterialIcons name="refresh" size={24} color="white" />
                            <Text style={styles.buttonText}>Choose Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.galleryPrompt}>
                    <MaterialIcons name="photo-library" size={80} color="#999" />

                    {/* Direct gallery selection without crop/edit screen */}
                    <TouchableOpacity
                        style={styles.pickImageButton}
                        onPress={pickImage}
                    >
                        <MaterialIcons name="add-photo-alternate" size={24} color="white" />
                        <Text style={styles.pickImageText}>Select Image Directly</Text>
                    </TouchableOpacity>

                    {/* Option with edit ability */}
                    <TouchableOpacity
                        style={[styles.pickImageButton, styles.editButton]}
                        onPress={pickImageWithEdit}
                    >
                        <MaterialIcons name="crop" size={24} color="white" />
                        <Text style={styles.pickImageText}>Select and Crop Image</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Loading overlay */}
            {(isUploading || isSaving) && <LoaderOverlay message={loadingMessage} />}

            {/* Modal to ask for plant name */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Enter Plant Name:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Plant name"
                            value={plantName}
                            onChangeText={setPlantName}
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveData}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.modalButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                disabled={isSaving}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    previewContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    galleryPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 20,
    },
    image: {
        width: '100%',
        height: '70%',
        resizeMode: 'contain',
    },
    buttonRow: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 15,
        borderRadius: 12,
        minWidth: 180,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    pickImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#32CD32',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        width: '80%',
        justifyContent: 'center',
    },
    editButton: {
        backgroundColor: '#3498db',
        marginTop: 15,
    },
    pickImageText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 15,
        fontWeight: '500',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#32CD32',
    },
    cancelButton: {
        backgroundColor: '#ff6347',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loaderBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        color: 'black',
    },
});