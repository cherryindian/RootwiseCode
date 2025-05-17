import {Account, Avatars, Client, Databases, OAuthProvider, Query, Storage, ID} from 'react-native-appwrite';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import {openAuthSessionAsync} from "expo-web-browser";

export const config = {
    platform: 'com.cherryindian.RootWise',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    diseasesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_DISEASES_COLLECTION_ID,
    userImageCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERIMAGE_COLLECTION_ID,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper function to check if user is logged in
export async function isLoggedIn() {
    try {
        await account.get();
        return true;
    } catch (error) {
        return false;
    }
}

export async function login() {
    try {
        // First check if there's an existing session we can use
        try {
            const currentSession = await account.get();
            if (currentSession.$id) {
                console.log('User already has active session');
                return true; // User is already logged in
            }
        } catch (sessionError) {
            // No active session, continue with login flow
            console.log('No active session, proceeding with login');
        }

        const redirectUri = Linking.createURL('(root)/(tabs)');

        const response = account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        );

        if (!response) throw new Error('Failed to login');

        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        )

        if(browserResult.type !== 'success' ) throw new Error('Failed to login');

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!userId || !secret) throw new Error('Failed to login');

        const session = await account.createSession(userId, secret);

        if(!session) {
            throw new Error('Failed to create Session')
        }

        return true;

    } catch (error) {
        console.error(error);
        return false;
    }
}


export async function logout() {
    try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            await account.deleteSession("current");
            return true;
        }
        return true; // Already logged out
    } catch (error) {
        console.error(error);
        return false;
    }
}


export async function getCurrentUser() {
    try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
            return null; // Return null for guest users
        }

        const response = await account.get();

        if(response.$id) {
            const userAvatar = avatar.getInitials(response.name);
            return {
                ...response,
                avatar: userAvatar.toString(),
            }
        }
        return response;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Rest of your code remains unchanged...

export async function getLatestDisease() {
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.diseasesCollectionId!,
            [Query.orderAsc('$createdAt'), Query.limit(5)],
        )

        return result.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getDisease({ query }: { query: string }) {
    try {
        const buildQuery = [Query.orderAsc('name'), Query.limit(100)];

        if (query) {
            buildQuery.push(Query.search('name', query));
        }

        const result = await databases.listDocuments(
            config.databaseId!,
            config.diseasesCollectionId!,
            buildQuery,
        );

        return result.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function saveData(file:string, username: string, plantName: string, result:any) {
    try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
            throw new Error('User must be logged in to save data');
        }

        const res = await databases.createDocument(
            config.databaseId!,
            config.userImageCollectionId!,
            'unique()',
            {
                name: username,
                disease: result.class,
                plantname: plantName,
                image: file
            }
        );
        return res;
    } catch (error) {
        console.error('Failed to save data:', error);
        throw error;
    }
}

export async function getuserImageData({user, filter}:{user: string, filter:string}) {
    try {
        const buildQuery = [Query.orderDesc('$createdAt')];

        if(user) {
            buildQuery.push(
                Query.equal('name',user)
            );
        }

        if(filter && filter !== 'All') buildQuery.push(Query.equal('plantname',filter));

        const result = await databases.listDocuments(
            config.databaseId!,
            config.userImageCollectionId!,
            buildQuery,
        )

        return result.documents;
    }
    catch(error) {
        console.error(error);
        return []
    }
}

export async function uploadImageToStorage(uri: string) {
    try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
            throw new Error('User must be logged in to upload images');
        }

        const id = ID.unique();
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (!fileInfo.exists) {
            throw new Error(`File does not exist at URI: ${uri}`);
        }

        const formData = {
            name: 'userGivenImage.jpg',
            type: 'image/jpeg',
            size: fileInfo.size,
            uri: uri,
        } as any;

        const response = await storage.createFile(
            config.bucketId!,
            id,
            formData,
        );

        console.log('Upload successful:', response);
        return id;

    } catch (error: any) {
        console.error('Error uploading image:', error);
        if (error.response) {
            console.error('Appwrite error details:', error.response);
        }
        throw error;
    }
}


export async function getUniquePlantNames(userEmail: string) {
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.userImageCollectionId!,
            [
                Query.equal('name', userEmail),
                Query.orderDesc('$createdAt')
            ]
        );

        const uniquePlantNames = Array.from(
            new Set(result.documents.map(doc => doc.plantname))
        );

        return uniquePlantNames;
    } catch (error) {
        console.error("Failed to fetch unique plant names:", error);
        return [];
    }
}


export const getSingleDisease = async ({ id }: { id: string }) => {
    try {
        const res = await databases.getDocument(
            config.databaseId!,
            config.diseasesCollectionId!,
            id
        );
        return {
            name: res.name,
            cure: res.cure,
            imageUrl: res.image,
        };
    } catch (error) {
        console.error('Failed to get disease:', error);
        throw error;
    }
};

export const updateUserAvatar = async (storageId: string, oldUrl: string) => {
    try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
            throw new Error('User must be logged in to update avatar');
        }

        if(oldUrl !== "" && oldUrl !== undefined) {
            const urlParts = oldUrl.split("/");
            const oldFileId = urlParts.length > 2 ? urlParts[urlParts.length - 2] : null;

            if (!config.bucketId) {
                console.error("Error: config.bucketId is undefined or null.");
                throw new Error("config.bucketId is not defined.");
            }

            if (oldFileId) {
                await storage.deleteFile(config.bucketId, oldFileId);
                console.log("Old profile image deleted from Appwrite storage");
            }
        }

        const promise = account.updatePrefs({ imageUrl: storageId });

        promise.then(
            function (response) {
                console.log("Profile pic updated successfully");
            },
            function (error) {
                console.log("Error updating preferences:", error);
            }
        );
    } catch (error) {
        console.error("Failed to update preferences", error);
        throw error;
    }
};

export const getUserAvatar = async () => {
    try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
            return ""; // Return empty string for guest users
        }

        const promise = account.getPrefs();
        const response = await promise;
        const imageUrl = response.imageUrl || '';
        return imageUrl;
    } catch (error) {
        console.error("Failed to get preferences", error);
        return "";
    }
};