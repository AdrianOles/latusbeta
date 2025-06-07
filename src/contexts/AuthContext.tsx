import { createContext, useState, useEffect, useContext } from "react";
import { fetchAuthSession, fetchUserAttributes, FetchUserAttributesOutput, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from 'react-native';

export type AuthUserCustomType = {
    email: string;
    school: string;
}

export type AuthUserType = {
    email: string;
    school: string;
}

export interface AuthContextType {
    authUser: AuthUserCustomType | null;
    loading: boolean;
    error: string;
    aFilter: 'all' | 'upcoming' | 'new' | 'created' | 'ending'
    schoolColor: string;
    theme: 'light' | 'dark';
    updateAuthUser: () => void;
    clearErrorState: () => void;
    updateSchool: (school: string) => void;
    updateAFilter: (filter: 'all' | 'upcoming' | 'new' | 'created' | 'ending') => void;
}

const AuthContext = createContext<AuthContextType>({
    authUser: null,
    loading: true,
    error: '',
    aFilter: 'all',
    schoolColor: '',
    theme: 'light',
    updateAuthUser: () => {},
    clearErrorState: () => { },
    updateSchool: (school: string) => { },
    updateAFilter: (filter: 'all' | 'upcoming' | 'new' | 'created' | 'ending') => {}
});

const removeAnnouncementKeys = async () => {
    try {
        // Get all keys from AsyncStorage
        const keys = await AsyncStorage.getAllKeys();

        // Filter keys that start with "announcements/"
        const announcementKeys = keys.filter(key => key.includes('announcements/'));

        // Remove each key
        await Promise.all(announcementKeys.map(key => AsyncStorage.removeItem(key)));

        console.log('Announcement keys removed successfully.');
    } catch (error) {
        console.error('Error removing announcement keys:', error);
    }
}


const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme(); // Returns 'light' or 'dark'
    const [authUser, setAuthUser] = useState<AuthUserCustomType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("")
    const [aFilter, setAFilter] = useState<'all' | 'upcoming' | 'new' | 'ending' | 'created'>("all");
    const [schoolColor, setSchoolColor] = useState('#0F0052');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        if (colorScheme) setTheme(colorScheme);
        
    }, [])

    useEffect(() => {
        if (authUser && authUser.school === 'STFX') {
            if (colorScheme) {
                if (colorScheme === 'light') {
                    setSchoolColor('#431DF040');
                } else {
                    setSchoolColor('#0F0052')
                }
            }
        } else {
            if (colorScheme) {
                if (colorScheme === 'light') {
                    setSchoolColor('#80A3FF80');
                } else {
                    setSchoolColor('#001F5C');
                }
            }
        }
    }, [authUser?.school])

    const updateAuthUser = async () => {
        try {
            const { userId } = await getCurrentUser();
            const response = (await fetchAuthSession()).tokens?.idToken?.payload["cognito:groups"];
            const attributes = await fetchUserAttributes();


            if (userId && attributes.email && attributes.picture) {

                const tempUser: AuthUserCustomType = {
                    email: attributes.email,
                    school: attributes.picture,
                }
                setAuthUser(tempUser);
            }
        } catch (err) {
            console.log(err);
            setAuthUser(null);
        } finally {
            setLoading(false);
        }
    };

    const isWithinLast12Hours = (timestampString: string): boolean => (new Date().getTime() - new Date(timestampString).getTime()) <= 12 * 60 * 60 * 1000;

    const updateImageCache = async () => {
        try {
            const value = await AsyncStorage.getItem('imageCache');

            if (value !== null) {
                // if (!isWithinLast12Hours(value)) {
                if (true) {
                    await removeAnnouncementKeys();
                    await AsyncStorage.setItem('imageCache', new Date().toString());
                }
            } else {
                await AsyncStorage.setItem('imageCache', new Date().toString());
            }
        } catch (e) {
            
        }
    }

    const updateSchool = (school: string) => {
        if (authUser) {
            const newUser: AuthUserCustomType = {
                ...authUser,
                school: school
            }

            setAuthUser(newUser);
        }
    }

    const clearErrorState = () => {
        setError("");
    }

    useEffect(() => {
        updateAuthUser();
    }, []);

    const updateAFilter = (filter: 'all' | 'upcoming' | 'new' | 'ending' | 'created') => {
        setAFilter(filter);
    }

    useEffect(() => {
        Hub.listen('auth', ({ payload }) => {
            console.log(payload)
            switch (payload.event) {
                case 'signedIn':
                    break;
                case 'signedOut':
                    break;
                case 'tokenRefresh':
                    break;
                case 'tokenRefresh_failure':
                    break;
                case 'signInWithRedirect':
                    updateAuthUser();
                    break;
                case 'signInWithRedirect_failure':
                    setLoading(false);
                    setError("Please sign in with your school account.")
                    break;
            }
        });

        updateImageCache();
    }, []);

    return (
        <AuthContext.Provider value={{ authUser, loading, updateAuthUser, error, clearErrorState, updateSchool, theme, aFilter, updateAFilter, schoolColor }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);
