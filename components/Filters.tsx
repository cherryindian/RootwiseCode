import React, {useState, useEffect, useCallback} from "react";
import { Text, ScrollView, TouchableOpacity } from "react-native";
import { useAppwrite } from "@/lib/useAppwrite";
import { getUniquePlantNames } from "@/lib/appwrite";
import {useLocalSearchParams, router, useFocusEffect} from "expo-router";
import {useGlobalContext} from "@/lib/global-provider";

type FiltersProps = {
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
};

const Filters = ({ selectedFilter, onFilterChange }: FiltersProps) => {
    const [plantNames, setPlantNames] = useState<string[]>([]);
    const {user}= useGlobalContext();

    // Fetch plant names from the API on component mount
    useFocusEffect(
        useCallback(() => {
            const fetchPlantNames = async () => {
                const plants = await getUniquePlantNames(user!.email);
                setPlantNames(plants);
            };

            fetchPlantNames();
        }, []) // Empty dependency array = runs on every focus
    );

    // Handle plant press and update filter
    const handlePlantPress = (plant: string) => {
        onFilterChange(plant === selectedFilter ? "All" : plant);  // Toggle filter
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-2">
            <TouchableOpacity
                onPress={() => handlePlantPress("All")}
                className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${
                    selectedFilter === "All" ? "bg-primary-300" : "bg-primary-100 border border-primary-200"
                }`}
            >
                <Text
                    className={`text-sm ${
                        selectedFilter === "All" ? "text-white font-rubik-bold mt-0.5" : "text-black-300 font-rubik"
                    }`}
                >
                    All
                </Text>
            </TouchableOpacity>

            {plantNames.map((plantName, index) => (
                <TouchableOpacity
                    onPress={() => handlePlantPress(plantName)}
                    key={index}
                    className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${
                        selectedFilter === plantName ? "bg-primary-300" : "bg-primary-100 border border-primary-200"
                    }`}
                >
                    <Text
                        className={`text-sm ${
                            selectedFilter === plantName
                                ? "text-white font-rubik-bold mt-0.5"
                                : "text-black-300 font-rubik"
                        }`}
                    >
                        {plantName}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default Filters;
