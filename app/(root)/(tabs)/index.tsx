import {Text, TouchableOpacity, View, Image, FlatList} from "react-native";
import {Link, router, useFocusEffect} from "expo-router";
import {HomeCard} from "@/components/Cards";
import Filters from "@/components/Filters";
import {SafeAreaView} from "react-native-safe-area-context";
import icons from "@/constants/icons";
import {useGlobalContext} from "@/lib/global-provider";
import {useAppwrite} from "@/lib/useAppwrite";
import {getDisease, getUserAvatar, getuserImageData} from "@/lib/appwrite";
import React, {useEffect, useCallback, useState} from "react";

export default function Index() {
    const {user} = useGlobalContext();
    const [filter, setFilter] = useState("All");
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [greeting, setGreeting] = useState<string>("Good Morning");

    const {data: image ,loading, refetch} = useAppwrite({
        fn: getuserImageData,
        params: {
            user: user!.email,
            filter: filter,
        }
    });

    // Handle filter change
    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);  // Update the selected filter
    };

    useFocusEffect(
        useCallback(() => {
            if (user) {
                refetch({ user: user.email, filter: filter });
            }
        }, [user, filter])

    );

    useEffect(() => {
        // Fetch the user's avatar URL when the component mounts
        const fetchAvatar = async () => {
            const url = await getUserAvatar();
            setAvatarUrl(url);  // Set the avatar URL in state
        };

        fetchAvatar();

        // Update greeting dynamically
        const getGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) {
                return "Good Morning";
            } else if (currentHour < 18) {
                return "Good Afternoon";
            } else {
                return "Good Evening";
            }
        };

        setGreeting(getGreeting());  // Set the dynamic greeting
    }, [user]);


    const handleHomeCardPress = (userid: string) => router.push({
        pathname: "/(root)/userInput/[userid]",
        params: { userid }
    });


    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView className="bg-white h-full">
                <FlatList
                    data={image}
                    renderItem={({ item }) => <HomeCard item={item} onPress={() => handleHomeCardPress((item.$id))} />}
                    keyExtractor={(item) => item.$id}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    columnWrapperClassName="flex gap-5 px-5 py-2"
                    showsHorizontalScrollIndicator={false}
                    ListHeaderComponent={
                        <View className="px-5">
                            <View className="flex flex-row items-center justify-between mt-5">
                                <View className="flex flex-row items-center">
                                    <Image source={{uri: avatarUrl || user!.avatar}} className="size-12 rounded-full" />
                                    <View className="flex flex-col items-start ml-2 justify-center">
                                        <Text className="text-xs font-rubik text-black-100">{greeting}</Text>
                                        <Text className="text-base font-rubik-medium text-black-300">{user?.name}</Text>
                                    </View>
                                </View>
                            </View>
                            <Filters selectedFilter={filter} onFilterChange={handleFilterChange} />
                        </View>

                    }
                />
            </SafeAreaView>

            <View
                style={{
                    position: "absolute",
                    bottom: 80,
                    right: 10,
                    flexDirection: "row",
                    borderRadius: 50,
                    overflow: "hidden",
                    elevation: 5,
                    backgroundColor: "white",
                }}
            >
                <Link href="/components/Camera" asChild>
                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 14,
                            paddingHorizontal: 20,
                            backgroundColor: "#3F6F28AF",
                        }}
                    >
                        <Image source={icons.camera} className="size-6" />
                    </TouchableOpacity>
                </Link>

                <Link href="/components/GalleryUpload" asChild>
                    <TouchableOpacity
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 14,
                            paddingHorizontal: 20,
                            backgroundColor: "#3F6F28FF",
                        }}
                    >
                        <Image source={icons.gallery} className="size-6" />
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
