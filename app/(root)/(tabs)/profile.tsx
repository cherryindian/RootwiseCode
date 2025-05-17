import {View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert} from "react-native";
import React, {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import icons from "@/constants/icons"
import {settings} from "@/constants/data";
import {useGlobalContext} from "@/lib/global-provider";
import {config, getUserAvatar, logout, updateUserAvatar, uploadImageToStorage} from "@/lib/appwrite";
import * as ImagePicker from "expo-image-picker";

interface SettingsItemsProps {
    icon: ImageSourcePropType;
    title: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?: boolean;
}

const SettingsItem = ({icon,title, onPress, textStyle, showArrow = true}:SettingsItemsProps) => (
    <TouchableOpacity onPress={onPress} className="flex flex-row items-center justify-between py-3">
        <View className="flex flex-row items-center gap-3">
            <Image source={icon} className="size-6" />
            <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`} >{title}</Text>
        </View>

        {showArrow && <Image source={icons.rightarrow} className="size-5" />}
    </TouchableOpacity>
)

const Profile = () => {
    const {user, refetch } = useGlobalContext();
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    useEffect(() => {
        const fetchAvatar = async () => {
            const url = await getUserAvatar();
            setAvatarUrl(url);
        };

        fetchAvatar();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access gallery is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        let id = ""
        if (!result.canceled) {
            id = await uploadImageToStorage(result.assets[0].uri);
        }

        await updateUserAvatar(`https://fra.cloud.appwrite.io/v1/storage/buckets/${config.bucketId}/files/${id}/view?project=${config.projectId}`,avatarUrl);
    };

    const handleLogout = async () => {
        const result = await logout();

        if(result) {
            Alert.alert("Success", "You have successfully logged out");
            refetch();
        }
        else{
            Alert.alert("Error", "An error occurred while logging out");
        }
    };

  return (
    <SafeAreaView className="h-full bg-white">
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-32 px-7"
        >
            <View className="flex flex-row items-center justify-betweeen mt-5">
                <Text className="text-xl font-rubik-bold">
                    Profile
                </Text>
            </View>

            <View className="flex-row justify-center flex mt-5">
                <View className="flex flex-col items-center relative mt-5">
                    <Image source={{uri: avatarUrl || user!.avatar}} className="size-44 relative rounded-full"/>
                    <TouchableOpacity className="absolute bottom-11 right-1" onPress={pickImage}>
                        <Image source={icons.edit} className="size-9"/>
                    </TouchableOpacity>
                    <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
                </View>
            </View>
            <View className="flex flex-col mt-10">
                {settings.map((item, index) => (
                    <SettingsItem key={index} {...item} />
                ))}
            </View>

            <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
                <SettingsItem icon={icons.logout} title="Logout" textStyle="text-danger" showArrow={false} onPress={handleLogout} />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
