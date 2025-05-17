import {View, Text, TouchableOpacity, Image, Dimensions} from 'react-native';
import React from 'react';
import images from "@/constants/images"
import icons from "@/constants/icons"
import {Models} from "react-native-appwrite"
import {config} from "@/lib/appwrite";

interface Props {
    item: Models.Document;
    onPress?: () => void;
}

interface Details {
    item: Models.Document;
    onPress?: () => void;
}

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const cardHeight = height / 4;
const cardWidth = width / 2.28;

export const HomeCard = ({item, onPress}: Props) => {
    if (!item) return null;

    const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${config.bucketId}/files/${item.image}/view?project=${config.projectId}`;

    return (
        <TouchableOpacity onPress={onPress} style={{height: cardHeight, width: cardWidth}}
                          className="flex flex-row items-start w-40 h-60 relative">
            <Image source={{ uri: imageUrl }} className="size-full rounded-2xl"/>
            <Image source={images.cardGradient} className="size-full rounded-2xl absolute bottom-0"/>

            <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
                <Text className="text-xl font-rubik-extrabold text-white" numberOfLines={1}>
                    {item.disease || "Unknown Disease"}
                </Text>
                <Text className="text-base font-rubik-extrabold text-white" numberOfLines={2}>
                    {item.plantname || "Unknown Plant"}
                </Text>
                <View className="flex flex-row items-center justify-between w-full">
                    <Text className="text-sm font-rubik-extrabold text-white">Click for details {">"}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}


export const ExploreCard = ({item, onPress}: Details) => {
    return (
        <TouchableOpacity onPress={onPress} className="flex flex-row items-start w-full h-20 relative bg-primary-200">
            <Image source={images.cardGradient} className="size-full rounded-2xl absolute bottom-0"/>
            <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
                <Text className="text-xl font-rubik-extrabold text-white" numberOfLines={1}>{item.name}</Text>
                <View className="flex flex-row items-center justify-between w-full">
                    <Text className="text-sm font-rubik-extrabold text-white">Click for details{'>'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
