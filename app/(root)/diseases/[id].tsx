import {View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppwrite } from "@/lib/useAppwrite";
import { getSingleDisease } from "@/lib/appwrite"; // You should have this API call
import React from "react";
import {Ionicons} from "@expo/vector-icons";

const DiseaseDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: disease, loading } = useAppwrite({
        fn: getSingleDisease,
        params: { id }
    });

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#3F6F28" />
            </View>
        );
    }

    if (!disease) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-lg font-bold">Disease not found.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView>

                <View className="absolute top-5 left-5 z-10">
                    <TouchableOpacity
                        className="bg-white p-2 rounded-full shadow"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#3F6F28" />
                    </TouchableOpacity>
                </View>

                {/* Disease Image */}
                <Image
                    source={{ uri: disease.imageUrl }}
                    className="w-full h-64"
                    resizeMode="cover"
                />

                {/* Disease Name */}
                <View className="p-5">
                    <Text className="text-2xl font-bold text-black-300 mb-3">{disease.name}</Text>

                    {/* Cure Information */}
                    <Text className="text-base text-black-200">{disease.cure}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DiseaseDetails;
