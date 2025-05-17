import {View, Text, Image, FlatList, ActivityIndicator} from "react-native";
import React, {useEffect} from "react";
import Search from "@/components/Search";
import { ExploreCard } from "@/components/Cards";
import { SafeAreaView } from "react-native-safe-area-context";
import {router, useLocalSearchParams} from "expo-router";
import {useAppwrite} from "@/lib/useAppwrite";
import {getDisease, getLatestDisease} from "@/lib/appwrite";
import NoResults from "@/components/NoResults";

const Explore = () => {
    const params = useLocalSearchParams<{query?:string}>();

    const {data:latestdiseases, loading:diseasesLoading} = useAppwrite({
        fn: getLatestDisease
    });

    const {data: diseases ,loading,refetch} = useAppwrite({
        fn: getDisease,
        params:{
            query: params.query!
        }
    })

    const handleCardPress = (id: string) => router.push({
        pathname: "/(root)/diseases/[id]",
        params: { id }
    });


    useEffect(() => {
        refetch({
            query: params.query!
        }
        )
    }, [params.query]);

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={diseases}
                renderItem={({ item }) => <ExploreCard item={item} onPress={()=>handleCardPress(item.$id)} />}
                keyExtractor={(item) => item.$id}
                contentContainerClassName="pb-32"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View className="px-5 py-5">
                        <Search />
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" className="text-primary-300 mt-5" />
                    ) : <NoResults/>
                }
                ItemSeparatorComponent={() => <View className="h-2.5" />}
            />
        </SafeAreaView>
    );
};

export default Explore;
