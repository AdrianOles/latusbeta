import { View, Text, TouchableOpacity, Pressable, Keyboard, ActivityIndicator, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import colors from "../../colors";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../navigation";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import SelectionPhase from "./components/SelectionPhase";
import LinkPhase from "./components/LinkPhase";
import { CreateResourceInput, CreateResourceMutation, ResourcesBySchoolAndBoardQuery } from "../../API";
import useSWR, { mutate, SWRResponse } from "swr";
import { generateClient, GraphQLQuery } from "aws-amplify/api";
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import FilePhase from "./components/FilePhase";
import { getUrl, remove, uploadData } from 'aws-amplify/storage';

const client = generateClient();

export const sanitizeFileName = (fileName: string): string => {
    let sanitizedName = fileName.trim().replace(/\s+/g, '-');
    sanitizedName = sanitizedName.replace(/[^a-zA-Z0-9.\-]/g, '');

    return sanitizedName;
};

const checkLink = async (link: string): Promise<boolean> => {
    let checkThis = link;
    if (!link.startsWith('https://')) {
        checkThis = `https://${link}`;
    }
    try {
        const canOpen = await Linking.canOpenURL(checkThis);
        if (!canOpen) return false
    } catch (e) {
        console.log(e)
    }

    try {
        const response = await fetch(checkThis, { method: 'HEAD' });
        if (response.ok) {
            // Check for potential redirects or unwanted content types
            const contentType = response.headers.get('Content-Type');
            const location = response.headers.get('Location');

            if (location) {
                return false
            } else if (contentType && contentType.includes('text/html')) {
                return true;
            } else {
                return false
            }
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

export const uriToBlob = async (uri: string): Promise<Blob> => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        return blob;
    } catch (error) {
        console.error("Error converting URI to File:", error);
        throw error;
    }
};

const Menu = () => {
    const { theme, authUser } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const [icon, setIcon] = useState<"grid-outline" | "globe-outline" | "document">("grid-outline");
    const [header, setHeader] = useState<string>("Create a resource");
    const [subText, setSubText] = useState<string>("What do you want to add?");
    const [selection, setSelection] = useState<"link" | "file" | null>(null);
    const [stage, setStage] = useState<number>(0); // 0 - selection, 1 - link, 2 - file
    const [link, setLink] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [file, setFile] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorState, setError] = useState<number>(0);
    /**
     * 0 - nothing; 1 - no link; 2- no title; 3 - invalid link
     * 4 - no title; 5 - no file
     */

    const fetchResources = async () => {
        const result = await client.graphql<GraphQLQuery<ResourcesBySchoolAndBoardQuery>>({
            query: queries.resourcesBySchoolAndBoard,
            variables: {
                schoolAndBoard: authUser?.school.toUpperCase() + "+" + "HCDSB",
            }
        })

        const allResources = result?.data?.resourcesBySchoolAndBoard?.items;

        return allResources;
    };

    const { data, error }: SWRResponse = useSWR('resources', fetchResources, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 600000, // 1 minute (or set to your desired interval)
    })

    const createResource = async (resourceDetails: CreateResourceInput) => {
        const { errors, data: newResource } = await client.graphql<GraphQLQuery<CreateResourceMutation>>({
            query: mutations.createResource,
            variables: {
                input: {
                    ...resourceDetails
                }
            }
        })

        if (!errors) {
            Toast.show({
                type: 'success',
                topOffset: 0
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } else {
            Toast.show({
                type: 'error',
                topOffset: 0
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
        return newResource;
    }

    const continuePress = () => {
        if (selection === 'link') {
            setIcon("globe-outline");
            setHeader("Add a link");
            setSubText("Where do you to take us?");
            setStage(1);
        } else if (selection === 'file') {
            setIcon("document");
            setHeader("Attach a file");
            setSubText("Any document under 10MB");
            setStage(2);
        } else {
            setIcon("grid-outline");
            setHeader("Create a resource");
            setSubText("What do you want to add?");
            setStage(0);
        }
    }

    const backPress = () => {
        setSelection(null);
        setIcon("grid-outline");
        setHeader("Create a resource");
        setSubText("What do you want to add?");
        setLink('');
        setTitle('');
        setFile(null)
        setError(0);
        setStage(0);
    }

    const handleClose = () => {
        navigation.goBack();
    }

    let content = (
        <SelectionPhase
            theme={theme}
            setSelection={(e) => setSelection(e)}
            selection={selection}
        />
    )

    if (stage === 1) {
        content = (
            <LinkPhase
                theme={theme}
                onChangeLink={(link) => setLink(link)}
                valueLink={link}
                onChangeTitle={(title) => setTitle(title)}
                valueTitle={title}
                error={errorState}
                onValid={() => { }}
                placeHolder={"Name your resource"}
            />
        )
    } else if (stage === 2) {
        content = (
            <FilePhase
                theme={theme}
                onChangeFile={(file) => setFile(file)}
                valueFile={file}
                onChangeTitle={(title) => setTitle(title)}
                valueTitle={title}
                onChangeSize={(size) => setFileSize(size)}
                onChangeType={(type) => setFileType(type)}
                error={errorState}
            />
        )
    }

    const handlePress = async () => {
        if (stage === 1) {
            if (title && link) {
                if (await checkLink(link)) submitLink()
                else  setError(3)
            } else if (!title) {
                setError(2);
            } else if (!link) {
                setError(1)
            }
        } else if (stage === 2) {
            if (title && file && fileSize && fileType) {
                try {
                    const response = await uriToBlob(file);
                    submitFile(response, fileType);
                } catch (e) {
                    console.log(e);
                } finally {
                }
            } else if (!title) {
                setError(4);
            } else if (!file) {
                setError(5)
            }
        } else {
            continuePress();
        }
    }
    
    const submitFile = async (uploadFile: Blob, type: string) => {
        if (title && file && fileSize && fileType && authUser && uploadFile) {
            setLoading(true);
            let result = null;
            try {
                const sanitizedName = sanitizeFileName(title);
                const path = `attachments/${sanitizedName}`;

                result = await uploadData({
                    path: path,
                    data: uploadFile,
                    options: {
                        metadata: { school: authUser.school },
                        onProgress: ({ transferredBytes, totalBytes }) => {
                            if (totalBytes) {
                                const progress = Math.round((transferredBytes / totalBytes) * 100);
                                setTimeout(() => console.log("Upload image progress: ", progress), 0); // forces log flush
                            }
                        },
                        contentType: type
                    }
                }).result;
            } catch (e) {
                console.log(e)
            } finally {
                if (result) {
                    const resourceDetails: CreateResourceInput = {
                        schoolAndBoard: authUser.school.toUpperCase() + "+" + "HCDSB",
                        content:
                        {
                            name: title,
                            address: result.path,
                            type: fileType,
                            size: fileSize,
                        }
                        ,
                        authorName: authUser.email,
                        authorId: authUser.email,
                        authorPicture: authUser.email,
                        authorRole: authUser.staffRole,
                        editType: [],
                        editorId: [],
                        editTime: [],
                        editorname: []
                    }

                    try {
                        if (resourceDetails && authUser) {
                            const newResource = resourceDetails;
                            const resources = [...data, newResource]
                            const options = {
                                optimisticData: resources,
                                rollbackOnError(error: any) {
                                    // If it's timeout abort error, don't rollback
                                    return error.name !== 'AbortError'
                                },
                            }
                            mutate('resources', createResource(resourceDetails), options);
                        }
                    } catch (err) {
                        console.log(err);
                    } finally {
                        handleClose();
                    }

                }
                setLoading(false);
            }
        }
    }

    const submitLink = async () => {
        if (stage === 1 && title && link && authUser) {
            setLoading(true);
            let checkThis = link;

            if (!link.startsWith('https://')) {
                checkThis = `https://${link}`;
            }

            const resourceDetails: CreateResourceInput = {
                schoolAndBoard: authUser.school.toUpperCase() + "+" + "HCDSB",
                content: 
                    {
                        name: title,
                        address: checkThis,
                        type: "url",
                        size: null,
                    }
                ,
                authorName: authUser.email,
                authorId: authUser.email,
                authorPicture: authUser.email,
                authorRole: authUser.staffRole,
                editType: [],
                editorId: [],
                editTime: [],
                editorname: []
            }

            try {
                if (resourceDetails && authUser) {
                    const newResource = resourceDetails;
                    const resources = [...data, newResource]
                    const options = {
                        optimisticData: resources,
                        rollbackOnError(error: any) {
                            // If it's timeout abort error, don't rollback
                            return error.name !== 'AbortError'
                        },
                    }
                    mutate('resources', createResource(resourceDetails), options);
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
                handleClose();
            }
        } 
    }

    return (
        <View style={{ height: '100%', backgroundColor: colors.background[theme].elevated, paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
            <StatusBar translucent={true} style={'light'} backgroundColor={'transparent'} />
            
            <Pressable onPress={() => Keyboard.dismiss()} style={{ height: 60, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'center', marginLeft: 'auto', }}>
                    <Ionicons
                        name="close-outline" size={26}
                        style={{
                            backgroundColor: colors.fills[theme].standard,
                            borderRadius: 250, padding: 4
                        }}
                        color={colors.text[theme].primary}
                    />
                </TouchableOpacity>
            </Pressable>

            <Pressable onPress={() => Keyboard.dismiss()} style={{alignItems: 'center', marginBottom: 24}}>
                <Ionicons name={icon} size={54} style={{ padding: 16 }} color={colors.text[theme].primary} />
                <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 22, lineHeight: 28, color: colors.text[theme].primary }}>{header}</Text>
                <Text style={{fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary}}>{subText}</Text>
            </Pressable>

            {content}

            <Pressable onPress={() => Keyboard.dismiss()} style={{ width: '100%', flexGrow: 1}} />
            
            <View style={{
                padding: 16, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.fills[theme].stroke,
                display: 'flex', flexDirection: 'row'
             }}>
                {stage != 0 && (
                    <TouchableOpacity onPress={backPress} style={{ flexGrow: 1, marginRight: 12,
                        padding: 24, borderRadius: 250, borderWidth: 2, borderColor: colors.fills[theme].stroke
                    }}>
                        <Text style={{ color: colors.text[theme].secondary, textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
                            Back
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity disabled={(loading||error || !selection)} onPress={handlePress} style={{ flexGrow: 1,
                    padding: 24, borderRadius: 250, backgroundColor: colors.text[theme].primary,
                    opacity: !(loading || error || !selection) ? 1 : 0.2
                }}>
                    {stage === 0 && !loading ? (
                        <Text style={{ color: colors.background[theme].general, textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
                            Continue
                        </Text>
                    ) : loading ? (
                        <ActivityIndicator style={{ alignSelf: 'center', marginHorizontal: 'auto' }}></ActivityIndicator>
                    ) : (
                        <Text style={{ color: colors.background[theme].general, textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
                            Attach
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Menu;
