import { createContext, useState, useEffect, useContext } from "react";
import { fetchAuthSession, fetchUserAttributes, FetchUserAttributesOutput, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from 'react-native';

export type AuthUserCustomType = {
    staffRole: 'student' | 'teacher' | 'admin';
    boardRole: 'HCDSB';
    schoolRole: string;
    lastName: string;
    firstName: string;
    email: string;
    picture: string;
    uuid: string;
    boardAccess: boolean;
}

export type AuthUserType = {
    email: string;
    picture: string;
    "family_name": string;
    "given_name": string;
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

interface UserGroups {
    staffRole: 'student' | 'teacher' | 'admin';
    schoolGroup: string;
    boardRole: 'HCDSB';
}

const categorizeGroups = (groups: any): UserGroups => {
    const defaultGroupPattern = /^ca-central.*_Google$/;
    const staffRoles = ['student', 'teacher', 'admin'];
    const boardRoles = ['HCDSB', 'HDSB']; // Add other board roles as needed

    let staffRole: 'student' | 'teacher' | 'admin' = 'student';
    let schoolGroup: string = 'STFX';
    let boardRole: 'HCDSB'= 'HCDSB';

    for (const group of groups) {
        // Ignore default Google group
        if (defaultGroupPattern.test(group)) {
            continue;
        }

        // Check if the group is a staff role
        if (staffRoles.includes(group.toLowerCase())) {
            staffRole = group.toLowerCase() as 'student' | 'teacher' | 'admin';
        } else if (boardRoles.includes(group)) {
            // Check if the group is a board role
            boardRole = group;
        } else {
            // Otherwise, assume it's the school group
            schoolGroup = group;
        }
    }

    return {
        staffRole,
        schoolGroup,
        boardRole
    };
};

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
        if (authUser && authUser.schoolRole === 'STFX') {
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
    }, [authUser?.schoolRole])

    const updateAuthUser = async () => {
        try {
            const { userId } = await getCurrentUser();
            const response = (await fetchAuthSession()).tokens?.idToken?.payload["cognito:groups"];
            const categorizedGroups = categorizeGroups(response);
            const attributes = await fetchUserAttributes();


            if (userId && attributes && attributes.family_name && attributes.given_name && attributes.email && attributes.picture && attributes.sub) {
                const schoolDesignation = categorizedGroups.schoolGroup === 'BOARDACCESS' ? 'STFX' : categorizedGroups.schoolGroup;

                const tempUser: AuthUserCustomType = {
                    staffRole: categorizedGroups.staffRole,
                    schoolRole: schoolDesignation,
                    boardRole: categorizedGroups.boardRole,
                    lastName: attributes.family_name,
                    firstName: attributes.given_name,
                    email: attributes.email,
                    picture: attributes.picture,
                    uuid: attributes.sub,
                    boardAccess: categorizedGroups.schoolGroup === 'BOARDACCESS' ? true : false,
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
                schoolRole: school
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
