import { TouchableHighlight, View, Text, Image, TouchableOpacity, Pressable, Modal, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getUrl, remove } from "aws-amplify/storage";
import React, { useEffect, useMemo, useState, } from "react";
import { Ionicons } from '@expo/vector-icons';
import { generateClient, GraphQLQuery } from "aws-amplify/api";
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import useSWR, { mutate, SWRResponse, useSWRConfig } from "swr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../../../contexts/AuthContext";
import { HomeStackParamList } from "../../../navigation";
import colors from "../../../colors";
import ModalButton from "../../../components/ModalButton";
import { Announcement, Attach, AttachInput, CreateAnnouncementInput, UpdateAnnouncementMutation } from "../../../API";
import * as mutations from '../../../graphql/mutations';
import ProfileGen from "../../../components/ProfileGen";


interface ACardProps {
    title: string;
    body: string;
    author: {
        name: string;
        picture: string;
    };
    index: number;
    image: string | null | undefined;
    aspectRatio: string | null | undefined;
    id: string;
    filters: string[];
    startDate: string;
    endDate: number;
    createdDate: string;
    attachments: (Attach | null)[] | null | undefined;
    sched: boolean;
    later: boolean;
    tmrw: boolean;
    skip: boolean | null | undefined;
    editDetails: {
        names: (string | null)[]
        ids: (string | null)[]
        times: (string | null)[]
        forms: (string | null)[]
    }
}

const client = generateClient();

const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

const timeUntilFiveMinutesInSeconds = (date: Date, createdDate: Date, skip: boolean | null | undefined): string | null => {
    if (isSameDay(date, new Date()) && isSameDay(createdDate, new Date())) {
        const now = Date.now(); // current time in milliseconds
        const targetTime = createdDate.getTime(); // target date in milliseconds

        // 5 minutes in milliseconds
        const fiveMinutesInMillis = 5 * 60 * 1000;

        // Time until 5 minutes after the target date in milliseconds
        const timeRemainingInMillis = (targetTime + fiveMinutesInMillis) - now;

        // Convert to seconds and ensure it's not negative
        const timeRemainingInSeconds = Math.max(Math.floor(timeRemainingInMillis / 1000), 0);

        // Calculate minutes and seconds
        const minutes = Math.floor(timeRemainingInSeconds / 60);
        const seconds = timeRemainingInSeconds % 60;

        if (timeRemainingInSeconds > 0 && !skip) {
            // Format the string
            const minutesPart = minutes > 0 ? `${minutes}:` : '';
            const secondsPart = seconds > 9 ? `${seconds}s` : `0${seconds}s`;

            return `${minutesPart}${secondsPart}`.trim();
        } else {
            return null;
        }
    } else {
        return null;
    }
}

const ACard: React.FC<ACardProps> = ({ title, body, author: { name, picture }, index, image, aspectRatio, id, filters, startDate, endDate, createdDate, sched, later, tmrw, skip, editDetails, attachments }) => {
    const navigation = useNavigation<HomeStackParamList>();
    //const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const { cache } = useSWRConfig();
    const [pending, setPending] = useState(timeUntilFiveMinutesInSeconds(new Date(startDate), new Date(createdDate), skip));
    const { authUser, aFilter, theme } = useAuthContext();

    // Get cached data without re-fetching
    const cachedData = cache.get('announcements');

    //Open viewing modal
    const handleCardPress = (index: number) => {
        navigation.navigate('ViewModal', { id: index })
    }

    //(Deletion) Query and API call to amplify and AppSync
    const onDelete = async () => {
        if (authUser) {
            let pictureResult = true;

            if (image) {
                pictureResult = false;

                //Try to remove S3 image
                try {
                    const response = await remove({
                        path: image
                    });
                    await AsyncStorage.removeItem(image);

                    console.log(response)
                    pictureResult = true;
                } catch (error) {
                    console.log(error)
                    Toast.show({
                        type: 'error',
                        topOffset: 0
                    })
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                }
            }

            if (pictureResult) {
                const result = await client.graphql<GraphQLQuery<UpdateAnnouncementMutation>>({
                    query: mutations.updateAnnouncement,
                    variables: {
                        input: {
                            id: id,
                            deleted: true,
                            schoolAndBoard: authUser.school.toUpperCase() + "+" + "HCDSB",
                            editorId: [...editDetails.ids, authUser.email],
                            editTime: [...editDetails.times, new Date().toString()],
                            editType: [...editDetails.forms, "deletion"],
                            editorname: [...editDetails.names, authUser.email],
                        }
                    }
                })

                if (result?.errors) {
                    Toast.show({
                        type: 'error',
                        topOffset: 0
                    })
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                } else {
                    Toast.show({
                        type: 'delete',
                        topOffset: 0
                    })
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                }
            }
        }
    }

    //Deletion process logic for loading/async promise/optimistic UI
    const deleteAnnouncement = async () => {
        setLoading(true);
        if (cachedData?.data) {

            const updatedAnnouncements = cachedData.data.filter((announcement: Announcement) => announcement.id !== id);
            const options = {
                optimisticData: updatedAnnouncements,
                rollbackOnError(error: any) {
                    // If it's timeout abort error, don't rollback
                    return error.name !== 'AbortError'
                },
            }

            await mutate('announcements', onDelete(), options);
        }
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                setLoading(false);
                console.log("timeout complete");
                resolve();
            }, 4000);
        });
    }

    const editCounter = async () => {
        if (id && authUser) {
            const result = await client.graphql({
                query: mutations.updateAnnouncement,
                variables: {
                    input: {
                        id: id,
                        skip: true,
                        schoolAndBoard: authUser.school.toUpperCase() + "+" + "HCDSB",
                        editorId: [...editDetails.ids, authUser.email],
                        editTime: [...editDetails.times, new Date().toString()],
                        editType: [...editDetails.forms, "edit counter"],
                        editorname: [...editDetails.names, authUser.email],
                    }
                }
            })

            if (!result.errors) {
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
        }
    }

    const skipCounter = async () => {
        setLoading(true);
        setEditLoading(true);
        if (authUser && id && cachedData) {
            const announcementDetails: CreateAnnouncementInput = {
                schoolAndBoard: authUser.school.toUpperCase() + "+" + "HCDSB", //EX. "SFTX+HCDSB"
                title: title,
                body: body,
                path: image,
                aspectRatio: aspectRatio,
                startDate: startDate,
                endDate: endDate,
                attachments: attachments,
                archiveDate: endDate + (14 * 24 * 60 * 60),
                authorName: authUser.email,
                authorPicture: authUser.email,
                authorId: authUser.email,
                authorRole: authUser.staffRole,
                editorId: [authUser.email],
                editTime: [Math.floor(new Date().getTime() / 1000).toString()],
                editType: ['create'],
                editorname: [authUser.email],
                id: id,
                deleted: false,
                skip: false
            }

            const updatedAnnouncements = cachedData.data.map((announcement: { id: any; }) =>
                announcement.id === id ? announcementDetails : announcement
            );

            const options = {
                optimisticData: updatedAnnouncements,
                rollbackOnError(error: any) {
                    // If it's a timeout abort error, don't rollback
                    return error.name !== 'AbortError';
                },
            };
            mutate('announcements', editCounter(), options);
        }

        setTimeout(() => {
            setLoading(false);
            setEditLoading(false);
            setOpen(false);
        }, 400)
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            setPending(timeUntilFiveMinutesInSeconds(new Date(startDate), new Date(createdDate), skip));
        }, 1000); // Update every second

        // Clean up the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, [startDate, skip, createdDate, cachedData]);

    const formatDate = (date: Date): string => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        if (isToday) {
            return "today";
        } else if (isTomorrow) {
            return "tomorrow";
        } else {
            const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
    }

    const isTomorrow = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    }

    const formattedEndDate = useMemo(() => formatDate(new Date(endDate)), [endDate]);
    const formattedStartDate = useMemo(() => formatDate(new Date(startDate)), [startDate]);
    
    const expandModal = () => {
        if (pending) {
            Alert.alert('What would you like to do?','', [
                {
                    text: 'Start announcement now',
                    onPress: () => skipCounter(),
                    style: 'default',
                },
                {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Delete announcement',
                    onPress: () => deleteAnnouncement(),
                    style: 'destructive',

                },
            ]);
        } else {
            Alert.alert('Delete', 'Are you sure you want to delete this announcement?', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel', // This style makes the button look like a cancel button (iOS only)
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteAnnouncement(),
                },
            ]);
        }
            
    }

    return (
        <>
            {
                (((pending != null) && (authUser?.staffRole === 'ADMIN' || filters.includes('CREATED'))) || (pending === null)) && (
                    <>
                        {/* Tomorrow */}
                        {
                            tmrw && aFilter === 'upcoming' && (
                                <View style={{ display: 'flex', justifyContent: 'flex-end', height: 72, borderBottomColor: '#333333', borderWidth: 0 }}>
                                    <Text style={{ color: colors.text[theme].primary, paddingLeft: 16, lineHeight: 48, fontSize: 22, fontFamily: 'Figtree-Bold' }}>Tomorrow</Text>
                                </View>
                            )
                        }
                        {
                            later && aFilter === 'upcoming' && (
                                <View style={{ display: 'flex', justifyContent: 'flex-end', height: 72, borderBottomColor: '#333333', borderWidth: 0 }}>
                                    <Text style={{ color: colors.text[theme].primary, paddingLeft: 16, lineHeight: 48, fontSize: 22, fontFamily: 'Figtree-Bold' }}>Later</Text>
                                </View>
                            )
                        }
                        {
                            sched && aFilter === 'created' && (
                                <View style={{ display: 'flex', justifyContent: 'flex-end', height: 72, borderBottomColor: '#333333', borderWidth: 0 }}>
                                    <Text style={{ color: colors.text[theme].primary, paddingLeft: 16, lineHeight: 48, fontSize: 22, fontFamily: 'Figtree-Bold' }}>Scheduled</Text>
                                </View>
                            )
                        }
                        <View style={{
                            position: 'relative', zIndex: 10, backgroundColor: 'transparent', borderColor: colors.fills[theme].stroke, borderBottomWidth: 1,
                            display: (pending && (filters.includes("CREATED") || authUser?.staffRole === 'ADMIN')) || !pending ? 'flex' : 'none'
                        }}>
                            <>
                                <TouchableHighlight underlayColor={colors.fills[theme].stroke} onPress={() => handleCardPress(index)}
                                    style={{
                                        display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', paddingLeft: 8, paddingVertical: 20, paddingRight: 16,
                                        position: 'relative', minHeight: 96
                                    }}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginRight: 8 }}>
                                            <View style={{ width: 6, aspectRatio: 1, borderRadius: 250, backgroundColor: '#FFFFFF00' }} />
                                            {authUser && (
                                                <Image
                                                    width={40}
                                                    height={40}
                                                    source={{ uri: picture }}
                                                    style={{borderRadius: 250}}
                                                />
                                            )}
                                        </View>
                                        <View style={{ paddingRight: (authUser?.staffRole === 'ADMIN' || filters.includes("CREATED")) ? 44 : 0, flex: 1 }}>
                                            <Text numberOfLines={2} ellipsizeMode="tail" style={{ textAlignVertical: 'bottom', fontSize: 16, lineHeight: 20, fontFamily: 'Figtree-SemiBold', color: colors.text[theme].primary }}>
                                                {title}
                                            </Text>
                                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                {
                                                    aFilter != 'created' && !pending && (
                                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                                                            <Text style={{ color: colors.text[theme].secondary, fontSize: 14, lineHeight: 18, fontFamily: 'Figtree-Medium', flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
                                                                {name}
                                                            </Text>
                                                            {
                                                                !isTomorrow(new Date(startDate)) && aFilter === 'upcoming' && <Text style={{ marginLeft: 4, color: colors.text[theme].tertiary }}>{formatDate(new Date(startDate))}</Text>
                                                            }
                                                        </View>
                                                    )
                                                }
                                                {
                                                    //!MUST BE STRICT WIDTH TO ENSURE TRUNCATING DOESN'T CHANGE AS TIMER CHANGES
                                                    pending && (filters.includes("CREATED") || authUser?.staffRole === 'ADMIN') && (
                                                        <Text style={{ color: colors.system[theme].green, fontSize: 14, lineHeight: 18, fontFamily: 'Figtree-Medium' }}>Starts in {pending}</Text>
                                                    )
                                                }
                                                {
                                                    filters.includes("UPCOMING") && filters.includes("CREATED") && aFilter === 'created' && (
                                                        <Text style={{ color: colors.text[theme].secondary, fontSize: 14, lineHeight: 18, fontFamily: 'Figtree-Medium' }}>Starts {formattedStartDate}</Text>
                                                    )
                                                }

                                                {
                                                    filters.includes("CREATED") && !filters.includes("UPCOMING") && aFilter != 'new' && aFilter != 'all' && !pending && (
                                                        <Text style={{ color: colors.text[theme].secondary, fontSize: 14, lineHeight: 18, fontFamily: 'Figtree-Medium' }}>Ends {formattedEndDate}</Text>
                                                    )
                                                }
                                            </View>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                {
                                    (authUser?.staffRole === 'ADMIN' || filters.includes("CREATED")) && !loading && (
                                        <TouchableOpacity onPress={expandModal} style={{ position: 'absolute', right: 0, bottom: 0, top: 0, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                                            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text[theme].secondary} />
                                        </TouchableOpacity>
                                    )
                                }
                                {
                                    loading && (
                                        <ActivityIndicator style={{ position: 'absolute', right: 0, bottom: 0, top: 0, paddingHorizontal: 16}} />
                                    )
                                }
                            </>
                        </View>
                    </>
                )
            }
        </>
    )
}

export default ACard;