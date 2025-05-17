import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
    Alert, Button, Image, Modal, StyleSheet,
    Text, TextInput, TouchableOpacity, View, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { saveData, uploadImageToStorage } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useNavigation } from '@react-navigation/native';
import { router } from "expo-router";

const LoaderOverlay = ({ message = "Processing..." }) => (
    <View style={styles.loaderOverlay}>
        <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#32CD32" />
            <Text style={styles.loaderText}>{message}</Text>
        </View>
    </View>
);

export default function App() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [plantName, setPlantName] = useState('');
    const [diseaseResult, setDiseaseResult] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("Processing...");

    const { user } = useGlobalContext();
    const navigation = useNavigation();

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    async function takePicture() {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setPhotoUri(photo.uri);
        }
    }

    function retakePicture() {
        setPhotoUri(null);
    }

    async function uploadPicture(uri: string) {
        try {
            setIsUploading(true);
            setUploadMessage("Analyzing image...");

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
            if (!photoUri) {
                Alert.alert('Error', 'No photo to upload.');
                return;
            }

            setLoading(true); // Start loading
            setUploadMessage("Uploading to storage...");

            const file = await uploadImageToStorage(photoUri);
            console.log('File uploaded:', file);

            setUploadMessage("Saving plant data...");
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
            setLoading(false); // Stop loading
        }
    }

    function savePicture() {
        if (photoUri && !isUploading) {
            console.log('Uploading picture:', photoUri);
            uploadPicture(photoUri);
        }
    }

    return (
        <View style={styles.container}>
            {photoUri ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: photoUri }} style={styles.preview} />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={retakePicture}
                            disabled={isUploading}
                        >
                            <MaterialIcons name="refresh" size={24} color="white" />
                            <Text style={styles.actionText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                isUploading && styles.disabledButton
                            ]}
                            onPress={savePicture}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text style={styles.actionText}>Processing...</Text>
                                </>
                            ) : (
                                <>
                                    <MaterialIcons name="check-circle" size={24} color="white" />
                                    <Text style={styles.actionText}>Save</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                            <Ionicons name="camera-reverse" size={28} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.shutterOuter} onPress={takePicture}>
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>

                        <View style={styles.iconButton} />
                    </View>
                </CameraView>
            )}

            {(loading || isUploading) && <LoaderOverlay message={uploadMessage} />}

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
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.modalButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                disabled={loading}
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
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 100,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
    },
    previewContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    preview: {
        flex: 1,
        resizeMode: 'contain',
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        gap: 8,
        minWidth: 120,
    },
    disabledButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    actionText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 6,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 30,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shutterOuter: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
    },
    iconButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
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