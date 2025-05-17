import {View, Text, ScrollView, Image, Dimensions, TouchableOpacity, Alert} from "react-native";
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
const { height, width } = Dimensions.get("window");

import images from "@/constants/images";
import icons from "@/constants/icons";
import {login} from "@/lib/appwrite";
import {useGlobalContext} from "@/lib/global-provider";
import {Redirect} from "expo-router";
const SignIn = () => {
    const {refetch, loading, isLoggedIn} = useGlobalContext();

    if(!loading && isLoggedIn) return <Redirect href="/" />;

    const handleLogin = async () => {
        const result = await login();

        if(result){
            refetch();
            console.log("login success");
        } else {
            Alert.alert('Error',"Failed to login");
        }
    };

  return (
    <SafeAreaView className="bg-white h-full">
        <ScrollView contentContainerClassName="h-full">
            <Image source={images.onboarding} style={{
                width: width,
                height: height * 0.4,
                resizeMode: "cover",
            }} />

            <View className="px-10">
                <Text className="text-base text-center uppercase font-rubik text-black-200">Welcome to RootWise</Text>

                <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
                    <Text className="text-primary-200">Growing Smarter</Text>,
                    {"\n"} One Diagnosis at a Time
                </Text>

                <Text className="text-lg font-rubik text-black-200 text-center mt-12">
                    Login to RootWise with Google
                </Text>
                <TouchableOpacity onPress={handleLogin} className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5">
                    <View className="flex flex-row items-center justify-center">
                        <Image source={icons.google} alt="Google" className="w-5 h-5" resizeMode="contain" />
                        <Text className="text-lg font-rubik-medium text-black-300 ml-2">Continue With Google</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
