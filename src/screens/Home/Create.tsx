import React, { useEffect, useState } from 'react'
import { View, Text, Image, Dimensions, ScrollView, TouchableOpacity, Pressable} from 'react-native'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { generateClient, GraphQLQuery } from 'aws-amplify/data';
import { AuthUserCustomType, useAuthContext } from '../../contexts/AuthContext';
import { HomeStackParamList } from '../../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';
import { Ionicons } from '@expo/vector-icons';
import CHeader from './components/CHeader';
import TextPhase from './components/TextPhase';
import CFooter from './components/CFooter';
import Card from '../Resources/components/Card';
import { FileData } from './AddFile';
import { LinkData } from './AddLink';
import { DateType } from './AddDate';
import { Attach, AttachInput, CreateAnnouncementInput, CreateAnnouncementMutation } from '../../API';
import { v4 as uuidv4 } from 'uuid';
import { mutate, useSWRConfig } from 'swr';
import * as mutations from '../../graphql/mutations';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { uploadData } from 'aws-amplify/storage';
import { sanitizeFileName, uriToBlob } from '../Resources/Menu';
import ErrorBanner from '../../components/ErrorBanner';

const client = generateClient();
const SCREEN_WIDTH = Dimensions.get('screen').width;

const Create = () => {
    const { authUser, updateAFilter, theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [image, setImage] = useState<string | null>(null);
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [file, setFile] = useState<FileData | null>(null);
    const [link, setLink] = useState<LinkData | null>(null);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date(new Date().setHours(23, 59, 59, 999)));
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<number>(0);
    const [ultError, setUltError] = useState<boolean>(false);
    const { cache } = useSWRConfig();
    const data = cache.get('announcements');
    /**
     * 0 - Nothing
     * 1 - No title
     * 2 - No body
     */

    useEffect(() => {
        if (ultError) {
            clearFile();
            clearImage();
            clearLink();
            setBody("");
            setTitle("");
            setLoading(false);
        }
    }, [ultError])

    const createAnnouncement = async (announcementDetails: CreateAnnouncementInput) => {
        let result = null;
        try {
            result = await client.graphql<GraphQLQuery<CreateAnnouncementMutation>>({
                query: mutations.createAnnouncement,
                variables: {
                    input: announcementDetails
                }
            })
        } catch (e) {
            setUltError(true);
            return;
        } finally {
            if (!result?.errors) {
                updateAFilter('created')
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
            return result?.data.createAnnouncement;
        }
    }

    const handleFileAdd = (file: FileData | null) => setFile(file);
    const handleLinkAdd = (link: LinkData | null) => setLink(link);
    const handleDateAdd = (dates: DateType) => {
        setStartDate(dates.startDate);
        setEndDate(dates.endDate)
    }
    const clearImage = () => {
        setImage(null);
        setImageBlob(null);
    }
    const clearLink = () => setLink(null);
    const clearFile = () => setFile(null);


    const submitFile = async (uploadFile: Blob, title: string, type: string, authUser: AuthUserCustomType): Promise<string | null> => {
        let result = null;
        if (uploadFile && title && authUser) {
            try {
                const idForCreation = uuidv4();
                const path = `attachments/${idForCreation}`;

                result = await uploadData({
                    path: path,
                    data: uploadFile,
                    options: {
                        metadata: { school: authUser.school },
                        contentType: type
                    },
                }).result;
            } catch (e) {
                console.log(e);
                setUltError(true);
            } finally {
                if (result) return result.path;
            }
        }
        return null;
    }

    const create = async () => {
        setLoading(true);
        if (title && body && authUser) {
            let picResult = null;
            let fileResult = null;
            if (imageBlob && image && imageBlob.size > 0) {
                const idForCreation = uuidv4();
                const path = `announcements/${idForCreation}`;

                try {
                    picResult = await uploadData({
                        path: path,
                        data: imageBlob,
                        options: {
                            metadata: { school: authUser.school },
                            contentType: imageBlob.type
                        }
                    }).result;
                    console.log("Succeeded: ", picResult);
                } catch (error) {
                    console.log('Error: ', error);
                    setUltError(true);
                    return;
                }
            }
            if (file) {
                try {
                    console.log("turning to blob")
                    const response = await uriToBlob(file.file);
                    console.log(response);
                    fileResult = await submitFile(response, file.title, file.fileType, authUser);
                    console.log('uploaded.')
                } catch (e) {
                    console.log(e);
                    setUltError(true);
                    return;
                }
            }
            const attachments: AttachInput[] = [
                ...(fileResult && file ? [{
                    name: file.title,
                    address: fileResult,
                    type: file.fileType,
                    ...(file.fileSize !== undefined ? { size: file.fileSize } : {}),
                }] : []),

                ...(link ? [{
                    name: link.title,
                    address: link.link,
                    type: "url",
                    size: null,
                }] : []),
            ];

            const temp = Math.floor(new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime() / 1000);

            const announcementDetails: CreateAnnouncementInput = {
                schoolAndBoard: authUser.school.toUpperCase() + "+" + "HCDSB", //EX. "SFTX+HCDSB"
                title: title,
                body: body,
                path: picResult?.path,
                aspectRatio: null,
                attachments: attachments,
                startDate: startDate.toString(),
                endDate: temp,
                archiveDate: Math.floor(new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime() / 1000) + (14 * 24 * 60 * 60), //Adding 14 days
                deleted: false,
                authorName: authUser.name,
                authorId: authUser.email,
                authorPicture: authUser.picture,
                authorRole: authUser.staffRole,
                skip: false,
                id: uuidv4(),
                editType: ["create"],
                editorId: [authUser.email],
                editTime: [new Date().toString()],
                editorname: [authUser.email]
            }

            const newAnnouncement = announcementDetails;
            const announcements = [...data?.data, newAnnouncement]
            const options = {
                optimisticData: announcements,
                rollbackOnError(error: any) {
                    // If it's timeout abort error, don't rollback
                    return error.name !== 'AbortError'
                },
            }

            mutate('announcements', createAnnouncement(announcementDetails), options);

            setLoading(false);
            navigation.goBack();
        } else if (!title) {
            setError(1);
            setLoading(false);
        } else if (!body) {
            setError(2);
            setLoading(false);
        }
    }

    if (authUser) {
        return (
            <SafeAreaView edges={["top"]} style={{
                justifyContent: 'space-between', height: '100%',
                backgroundColor: colors.background[theme].elevated, position: 'relative'
            }}>
                <CHeader disabled={loading} theme={theme} authUser={authUser} navigation={navigation} />

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 36 }}
                    style={{ flexGrow: 1, paddingHorizontal: 16, position: 'relative', height: '100%' }}
                >
                    <TextPhase
                        theme={theme}
                        title={title}
                        body={body}
                        disabled={loading}
                        changeTitle={(value) => setTitle(value)}
                        changeBody={(value) => setBody(value)}
                        error={error}
                    />

                    {!image && !file && !link && !imageLoading && (
                        <View style={{height: 200}} />
                    )}

                    {(image || imageLoading || file || link) && (
                        <View style={{ width: '100%', height: 1, backgroundColor: colors.fills[theme].stroke }} />
                    )}

                    {(image || imageLoading) && (
                        <View style={{ paddingTop: 12 }}>
                            <View style={{
                                backgroundColor: colors.fills[theme].standard, height: 200, aspectRatio: 0.80, borderRadius: 24, overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {image && !imageLoading && (
                                    <>
                                        <TouchableOpacity onPress={clearImage} style={{
                                            position: 'absolute', top: 8, right: 8, zIndex: 1, backgroundColor: "#E8E8EB",
                                            width: 36, aspectRatio: 1, borderRadius: 250, justifyContent: 'center'
                                        }}>
                                            <Ionicons size={24} name='remove-circle-outline' color={colors.system[theme].red} style={{ alignSelf: 'center' }} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => navigation.navigate("ImagePreview", {image: image})}>
                                            <Image
                                                style={{ width: '100%', height: '100%' }}
                                                source={{ uri: image }}
                                            />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {(file) && (
                        <View style={{marginTop: 12}}>
                            <Card
                                resource={false}
                                item={{
                                    name: file.title,
                                    address: file.file,
                                    type: file.fileType,
                                    size: file.fileSize
                                }}
                                id={''}
                                theme={theme}
                                onDelete={clearFile}
                                creating={true}
                            />
                        </View>
                    )}

                    {(link) && (
                        <View style={{ marginTop: 12 }}>
                            <Card
                                resource={false}
                                item={{
                                    name: link.title,
                                    address: link.link,
                                    type: "url",
                                    size: null
                                }}
                                id={''}
                                theme={theme}
                                onDelete={clearLink}
                                creating={true}
                            />
                        </View>
                    )}
                </ScrollView>

                <ErrorBanner theme={theme} active={ultError} onPress={() => setUltError(false)} />

                <CFooter
                    theme={theme}
                    authUser={authUser}
                    navigation={navigation}
                    startDefault={startDate}
                    endDefault={endDate}
                    imageChange={(image) => setImage(image)}
                    blobChange={(blob) => setImageBlob(blob)}
                    imageLoading={(state) => setImageLoading(state)}
                    imageAdded={image != null}
                    fileAdded={file != null}
                    linkAdded={link != null}
                    fileChange={handleFileAdd}
                    linkChange={handleLinkAdd}
                    dateChange={handleDateAdd}
                    disabled={loading}
                    create={create}
                />
            </SafeAreaView>
        )
    }
}

export default Create