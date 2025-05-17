import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppwrite } from "@/lib/useAppwrite";
import { databases, config } from "@/lib/appwrite";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {Query} from "react-native-appwrite";
import icons from "@/constants/icons";

const PlantDetails = () => {
    const { userid } = useLocalSearchParams<{ userid: string }>();
    const { data: plantData, loading } = useAppwrite({
        fn: async ({ userid }: { userid: string }) => {
            // Fetch the user's uploaded plant photo record
            const userImageDoc = await databases.getDocument(
                config.databaseId!,
                config.userImageCollectionId!,
                userid
            );

            // Fetch disease information based on the disease detected in the upload
            let diseaseDoc = null;
            try {
                const diseases = await databases.listDocuments(
                    config.databaseId!,
                    config.diseasesCollectionId!,
                    [
                        Query.equal('name', userImageDoc.disease)
                    ]
                );
                diseaseDoc = diseases.documents[0]; // Assuming exact match
            } catch (error) {
                console.error("Failed to fetch disease info", error);
            }

            const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${config.bucketId}/files/${userImageDoc.image}/view?project=${config.projectId}`;
            return {
                plantImage: imageUrl,
                plantName: userImageDoc.plantname,
                diseaseName: userImageDoc.disease,
                cure: diseaseDoc?.cure || null,
            };
        },
        params: { userid },
    });

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#3F6F28" />
            </View>
        );
    }

    if (!plantData) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-lg font-bold">Plant not found.</Text>
            </View>
        );
    }

    const renderCureMessage = () => {
        if (plantData.diseaseName.toLowerCase().includes("healthy")) {
            return "Your plant is healthy! Keep watering it and loving it 🌱❤️";
        } else if (!plantData.cure) {
            return "Our database doesn't have a cure for this disease yet, but we are working on it! Stay tuned.";
        } else {
            return plantData.cure;
        }
    };

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView>

                {/* Back Button */}
                <View className="absolute top-5 left-5 z-10">
                    <TouchableOpacity
                        className="bg-white p-2 rounded-full shadow"
                        onPress={() => router.back()}
                    >
                        <Image source={icons.backarrow} className="size-6" />
                    </TouchableOpacity>
                </View>

                {/* Plant Image */}
                <Image
                    source={{ uri: plantData.plantImage }}
                    className="w-full h-64"
                    resizeMode="cover"
                />

                {/* Plant Name and Disease Info */}
                <View className="p-5">
                    <Text className="text-2xl font-bold text-black-300 mb-3">{plantData.plantName}</Text>
                    <Text className="text-lg font-semibold text-black-400 mb-2">Detected Disease:</Text>
                    <Text className="text-base text-black-200 mb-5">{plantData.diseaseName}</Text>

                    {/* Cure or Message */}
                    <Text className="text-lg font-semibold text-black-400 mb-2">Cure / Advice:</Text>
                    <Text className="text-base text-black-200">{renderCureMessage()}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PlantDetails;
