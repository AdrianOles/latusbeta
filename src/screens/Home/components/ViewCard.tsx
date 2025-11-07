import { useNavigation } from '@react-navigation/native';
import { getUrl } from 'aws-amplify/storage';
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, View, Text, Image, LayoutChangeEvent, Pressable, Modal, ActivityIndicator, TouchableOpacity, ScrollView, Platform, Linking, PanResponder, Alert, GestureResponderEvent } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Attach, AttachInput } from '../../../API';
import { HomeStackParamList } from '../../../navigation';
import useAnnouncements from '../../../hooks/useAnnouncements';
import { useAuthContext } from '../../../contexts/AuthContext';
import colors from '../../../colors';
import ProfileGen from '../../../components/ProfileGen';
import Card from '../../Resources/components/Card';
import { head } from 'aws-amplify/api';
// import ImageView from "react-native-image-viewing";

interface ModalCardProps {
    index: number;
    title: string;
    body: string;
    endDate: number;
    path: string | null | undefined;
    aspectRatio: string | null | undefined;
    startDate: Date;
    createdDate: Date;
    author: {
        name: string;
        picture: string;
    };
    attachments: (AttachInput | null)[] | null;
    counter: number;
    skip: boolean;
    filterLabel: string;
    goBack: () => void;
    goNext: () => void;
}

const windowHeight = Dimensions.get('screen').height;
const windowWidth = Dimensions.get('screen').height;


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

const labelMaker = (filter: string) => {
    switch (filter) {
        case "all":
            return "Active";
        case "upcoming":
            return "Scheduled";
        default:
            return filter
    }
}

const ViewCard: React.FC<ModalCardProps> = ({ title, body, endDate, path, aspectRatio, index, author, counter,
    goBack, goNext, startDate, createdDate, skip, attachments, filterLabel }) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const navigation = useNavigation<HomeStackParamList>();
    const [open, setOpen] = useState<boolean>(false);
    const ahook = useAnnouncements();
    const { theme } = useAuthContext();

    const timeForCard = () => {
        const todayDate = new Date(new Date().setHours(23, 59, 59, 999));

        if ((new Date(startDate) <= todayDate) && !timeUntilFiveMinutesInSeconds(startDate, createdDate, skip)) {
            return (
                <>{labelMaker(filterLabel)}</>
            )
        } else if (timeUntilFiveMinutesInSeconds(startDate, createdDate, skip)) {
            return (
                <>Pending</>
            )
        } else {
            return (
                <>Starts {formatDate(startDate)}</>
            )
        }
    }

    const handlePress = (event: GestureResponderEvent) => {
        const windowWidth = Dimensions.get('window').width;
        const { pageX } = event.nativeEvent;
        const screenMidpoint = windowWidth / 2;

        if (pageX < screenMidpoint) {
            goBack();
        } else {
            goNext();
        }
    };

    //Fetch image data from S3 bucket
    const getImage = async (picture: string) => {
        try {
            const value = await AsyncStorage.getItem(picture);
            if (value !== null) {
                return value;
            } else {
                const getUrlResult = await getUrl({
                    path: picture,
                    options: {
                        validateObjectExistence: true,  // defaults to false
                        expiresIn: 20
                    },
                });

                const response = await fetch(getUrlResult.url);
                const blob = await response.blob();
                const reader = new FileReader();

                reader.onloadend = async () => {
                    const base64data = reader.result?.toString();
                    if (base64data) {
                        await AsyncStorage.setItem(picture, base64data);
                    }
                };

                reader.readAsDataURL(blob);

                // Wait for the image to be saved in AsyncStorage
                const savedValue = await AsyncStorage.getItem(picture);
                return savedValue || getUrlResult.url.toString();
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        const fetchImage = async (picture: string) => {
            try {
                const url = await getImage(picture);
                setImageUrl(url);
                setLoading(false);
            } catch (error) {
                console.log("Fetch picture error")
            } finally {
                setLoading(false);
            }
        };

        if (path) fetchImage(path);
    }, [path]);

    const imagePreview = (uri: string) => {
        navigation.navigate("ImagePreview", { image: uri })
    }

    return (
        <View style={{
            flex: 1,
            display: counter === index ? 'flex' : 'none',
            paddingTop: Platform.OS === 'ios' ? 60 : 16,
            zIndex: 0
        }}>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center', borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: 1, paddingBottom: 12, paddingHorizontal: 16 }}>
                {author && (
                    <Image
                        width={32}
                        height={32}
                        source={{ uri: author.picture }}
                        style={{borderRadius: 250}}
                    />
                )}
                <View>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: colors.text[theme].primary, fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 19 }}>
                            {author.name}
                        </Text>
                    </View>
                    <Text style={{ color: colors.text[theme].tertiary, fontFamily: 'Figtree-SemiBold', fontSize: 12, lineHeight: 14.4, letterSpacing: 0.01, textTransform: 'capitalize' }}>
                        {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(endDate * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                </View>
            </View>

            <ScrollView style={{
                padding: 16,
                flex: 1
            }}>
                {/* Text content */}
                <View>
                    <Text maxFontSizeMultiplier={1} style={{ color: colors.text[theme].primary, fontSize: 24, lineHeight: 34, fontFamily: 'Figtree-Bold' }}>{title}</Text>
                    <Text maxFontSizeMultiplier={1} style={{ color: colors.text[theme].body, fontSize: 18, lineHeight: 28, letterSpacing: 0.5, paddingRight: 10, fontFamily: 'Figtree-Medium' }}>
                        {body}
                    </Text>
                </View>

                <Pressable onPress={goBack} style={{ position: 'absolute', width: '50%', left: 0, top: 0, height: windowHeight, flexGrow: 1, zIndex: 2 }} />
                <Pressable onPress={goNext} style={{ position: 'absolute', width: '50%', right: 0, top: 0, height: windowHeight, flexGrow: 1, zIndex: 2 }} />

                {/* Image */}
                {
                    path && (
                        <>
                            {
                                imageUrl && (
                                    <TouchableOpacity onPress={() => imagePreview(imageUrl)} style={{ marginTop: 24, zIndex: 2, width: aspectRatio === '3:2' ? 150 : aspectRatio === '1' ? 150 : 100, height: aspectRatio === '3:2' ? 100 : aspectRatio === '1' ? 150 : 150, position: 'relative' }}>
                                        <Image
                                            onLoadStart={() => setLoading(true)}
                                            onLoad={() => setLoading(false)}
                                            source={{ uri: imageUrl }}
                                            width={aspectRatio === '3:2' ? 150 : aspectRatio === '1' ? 150 : 100}
                                            height={aspectRatio === '3:2' ? 100 : aspectRatio === '1' ? 150 : 150}
                                            style={{ borderRadius: 12, zIndex: 5 }}
                                        />
                                        <View style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF30', position: 'absolute', top: 0, left: 0, borderRadius: 12 }} />
                                    </TouchableOpacity>
                                )
                            }
                        </>
                    )
                }
                {attachments && attachments.map((attachment) => (
                    <>
                        <View style={{ height: 16 }} />
                        {attachment && (
                            <Card
                                item={{
                                    name: attachment.name,
                                    address: attachment.address,
                                    type: attachment.type,
                                    size: attachment.size
                                }}
                                id={''}
                                resource={false}
                                theme={theme}
                                onDelete={() => {}}
                                creating={false}
                            />
                        )}
                    </>
                ))}
                <View style={{ height: 48, width: '100%' }} />
                <View style={{ height: 600, width: '100%', backgroundColor: 'black', opacity: 0 }} />
            </ScrollView>


            {/* Footer View - takes up space based on its content. No need for marginTop: 'auto' with flexbox. */}
            <View style={{ borderTopColor: colors.fills[theme].stroke, borderTopWidth: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, paddingBottom: 32 }}>
                <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Bold', fontSize: 15, lineHeight: 18 }}>{index + 1}/{ahook.announcements?.length}</Text>
                <Text style={{ color: colors.text[theme].tertiary, fontFamily: "Figtree-SemiBold", fontSize: 12, lineHeight: 14.4 }}>{timeForCard()}</Text>
            </View>
        </View>

    )
}

export default ViewCard