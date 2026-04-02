import { createContext, useState, useEffect, useContext } from "react";
import { fetchAuthSession, fetchUserAttributes, FetchUserAttributesOutput, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from 'react-native';

export type AuthUserCustomType = {
    email: string;
    school: string;
    role: string;
    staffRole: 'STUDENT' | 'ADMIN' | 'TEACHER' | 'PARENT';
    name: string;
    picture: string;
}

export type AuthUserType = {
    email: string;
    school: string;
    role: string;
}

export interface AuthContextType {
    authUser: AuthUserCustomType | null;
    loading: boolean;
    staffRole: 'student' | 'admin' | 'teacher' | 'parent'
    error: string;
    aFilter: 'all' | 'upcoming' | 'new' | 'created' | 'ending'
    schoolColor: string;
    theme: 'light' | 'dark';
    updateAuthUser: () => void;
    clearErrorState: () => void;
    setError: (error: string) => void;
    updateSchool: (school: string) => void;
    updateAFilter: (filter: 'all' | 'upcoming' | 'new' | 'created' | 'ending') => void;
}

const AuthContext = createContext<AuthContextType>({
    authUser: null,
    staffRole: 'student',
    loading: true,
    error: '',
    aFilter: 'all',
    schoolColor: '',
    theme: 'light',
    updateAuthUser: () => {},
    clearErrorState: () => { },
    setError: (error: string) => {},
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

const possibleSchools = ["STFX", "ND", "AS", "BR"];


const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const colorScheme = useColorScheme();
    const [authUser, setAuthUser] = useState<AuthUserCustomType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("")
    const [aFilter, setAFilter] = useState<'all' | 'upcoming' | 'new' | 'ending' | 'created'>("all");
    const [schoolColor, setSchoolColor] = useState('#0F0052');
    const [theme, setTheme] = useState<'light' | 'dark'>(colorScheme || 'light');
    const staffRole = 'student';

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (colorScheme) {
                setTheme(colorScheme);
            }
        });

        // Cleanup the subscription on unmount
        return () => subscription.remove();
    }, []);
    
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

    function getSchool(responseData: any) {
        const schools = ["STFX", "ND", "AS", "BR", "STK", "CTK", "CC", "HT", "LOY", "STA", "DEMO"];
        if (responseData && responseData['cognito:groups']) {
            console.log("groups")
            console.log(responseData['cognito:groups'])
            for (const group of responseData['cognito:groups']) {
                if (schools.includes(group)) {
                    return group;
                }
            }
        }
        return "STFX"; // Return null if no school is found
    };

    function getRole(responseData: any) {
        const roles = ["STUDENT", "TEACHER", "ADMIN", "PARENT"];
        if (responseData && responseData['cognito:groups']) {
            for (const group of responseData['cognito:groups']) {
                if (roles.includes(group)) {
                    return group;
                }
            }
        }
        return "STUDENT"; // Return null if no school is found
    };

    const updateAuthUser = async () => {
        if (!authUser) setLoading(true);
        
        try {
            const { userId } = await getCurrentUser();
            const response = (await fetchAuthSession()).tokens?.idToken?.payload;
            const attributes = await fetchUserAttributes();

            const studentSchool = getSchool(response);
            const userRole = getRole(response);

            if (userId && attributes.email && attributes.picture) {

                const tempUser: AuthUserCustomType = {
                    email: attributes.email,
                    school: studentSchool,
                    role: userRole,
                    staffRole: userRole,
                    name: attributes["name"] ? attributes["name"] : attributes.email,
                    picture: attributes.picture
                }
                setAuthUser(tempUser);
                clearErrorState(); // FIX: Clear the error upon a successful fetch
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

    const setErrorMessage = (errorMessage: string) => {
        setError(errorMessage);
    }

    useEffect(() => {
        updateAuthUser();
    }, []);

    const updateAFilter = (filter: 'all' | 'upcoming' | 'new' | 'ending' | 'created') => {
        setAFilter(filter);
    }

    useEffect(() => {
        Hub.listen('auth', ({ payload }) => {
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
                    setError("")
                    break;
                case 'signInWithRedirect_failure':
                    setLoading(false);

                    // 1. Check if the error message contains "cancel"
                    const errString = String(payload.data?.error?.message || payload.data || '').toLowerCase();
                    const isCancel = errString.includes('cancel') || errString.includes('usercancelled');

                    // 2. Only set the error if they DID NOT cancel
                    if (!isCancel) {
                        setError("Please sign in with your school account.");
                    }
                    break;
            }
        });

        updateImageCache();
    }, []);

    return (
        <AuthContext.Provider value={{ staffRole, authUser, loading, updateAuthUser, error, clearErrorState, setError: setErrorMessage, updateSchool, theme, aFilter, updateAFilter, schoolColor }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);
