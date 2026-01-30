import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, Platform, Pressable, Image, Text, TouchableOpacity, View, SafeAreaView, ScrollView, Animated, ActivityIndicator, RefreshControl, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { generateClient, GraphQLQuery } from 'aws-amplify/api';
import SkeletonLoader from '../../components/SkeletonLoader';
import useSWR, { mutate } from 'swr';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Announcement, AnnouncementsBySchoolAndBoardQuery, AnnouncementsBySchoolAndBoardQueryVariables, Attach, AttachInput } from '../../API';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import colors from '../../colors';
import { signOut } from 'aws-amplify/auth';
import { HomeStackParamList } from '../../navigation';
import { LinearGradient } from 'expo-linear-gradient';
import useAnnouncements from '../../hooks/useAnnouncements';
import ACard from './components/ACard';
import AHeader from './components/AHeader';
import { StatusBar } from 'expo-status-bar';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const client = generateClient();
type LocalAnnouncement = Announcement & { displayFilters: string[], subTitles: string[] };

const sortByClosestToToday = (announcements: LocalAnnouncement[]) => {
    const today = new Date();

    return announcements.sort((a, b) => {
        const aDifference = Math.abs(new Date(a.startDate).getTime() - today.getTime());
        const bDifference = Math.abs(new Date(b.startDate).getTime() - today.getTime());

        return aDifference - bDifference;
    });
}

const organizeByStartDate = (announcements: LocalAnnouncement[]): LocalAnnouncement[] => {
    return announcements.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
}

const HomePage = () => {
    const navigation = useNavigation<HomeStackParamList>();
    const { authUser, aFilter, updateAFilter, schoolColor, theme, updateAuthUser } = useAuthContext();
    const ahook = useAnnouncements();
    const [showMessage, setShowMessage] = useState(false);
    const [viewableItems, setViewableItems] = useState<LocalAnnouncement[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [counts, setCounts] = useState({
        "all": 0,
        "upcoming": 0,
        "new": 0,
        "ending": 0,
        "created": 0
    })
    const [scheduled, setScheduled] = useState<string | null>(null);
    const [tomorrow, setTomorrow] = useState<string | null>(null);
    const [later, setLater] = useState<string | null>(null);

    const processAnnouncements = (announcements: LocalAnnouncement[]) => {
        let foundScheduled = false;
        let foundTomorrow = false;
        let foundLater = false;

        const todayDate = new Date();
        const tomorrow = new Date(todayDate);
        tomorrow.setDate(todayDate.getDate() + 1);
        const dayAfterTomorrowDate = new Date(tomorrow);
        dayAfterTomorrowDate.setDate(tomorrow.getDate() + 1);

        for (const announcement of announcements) {
            const { id, startDate, title, displayFilters } = announcement;

            if (!foundScheduled && (new Date(startDate) > todayDate) && displayFilters.includes("CREATED")) {
                setScheduled(id);
                foundScheduled = true;
            }

            if (new Date(new Date(startDate).setHours(0, 0, 0, 0)).toString() === new Date(new Date(tomorrow).setHours(0, 0, 0, 0)).toString() && !foundTomorrow) {
                setTomorrow(id);
                foundTomorrow = true;
            } else if (new Date(startDate) > tomorrow && !foundLater) {
                setLater(id)
                foundLater = true;
            }

            if (foundScheduled && foundTomorrow && foundLater) break;
        }
    };

    //Query and API call to amplify and AppSync
    //!Update fetch to first check in cache
    const fetchAnnouncements = async () => {
        setLoading(true);
        console.log("Fetching...");
        const variables: AnnouncementsBySchoolAndBoardQueryVariables = {
            schoolAndBoard: authUser?.school.toUpperCase() + "+" + "HCDSB",
            filter: {
                deleted: { eq: false },
                endDate: { ge: Math.floor(Date.now() / 1000) }
            }
        }

        try {
            const result = await client.graphql<GraphQLQuery<AnnouncementsBySchoolAndBoardQuery>>({
                query: queries.announcementsBySchoolAndBoard,
                variables: variables
            });

            setLoading(false);
            if (result?.data?.announcementsBySchoolAndBoard?.items) {
                return result.data.announcementsBySchoolAndBoard.items;
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    //Fetch announcements function for SWR
    const { data, error, isLoading } = useSWR('announcements', fetchAnnouncements, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    //Organizes announcements by adding filter attribute to each
    const organizeAnnouncements = (toBeOrganizged: Announcement[]) => {
        const today = new Date();

        // Check only for day, not hours
        const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

        const transformedAnnouncements: LocalAnnouncement[] = [];

        // Ensure toBeOrganizged is an array
        if (toBeOrganizged && Array.isArray(toBeOrganizged)) {
            toBeOrganizged.forEach((announcement: Announcement) => {
                const localAnnouncement = { ...announcement } as LocalAnnouncement;

                const startingDate = new Date(new Date(localAnnouncement.startDate).setHours(0, 0, 0, 0));
                const endingDate = new Date(localAnnouncement.endDate * 1000);

                localAnnouncement.displayFilters = [];

                if (startingDate <= today) {
                    localAnnouncement.displayFilters.push("ALL");
                    const temp = {
                        ...counts,
                        "all": counts['all']++,
                    }
                    setCounts(temp);
                } else {
                    localAnnouncement.displayFilters.push("UPCOMING");
                    const temp = {
                        ...counts,
                        "upcoming": counts['upcoming']++,
                    }
                    setCounts(temp);
                }
                if (isSameDay(startingDate, today)) {
                    localAnnouncement.displayFilters.push("NEW");
                    const temp = {
                        ...counts,
                        "new": counts['new']++,
                    }
                    setCounts(temp);
                }

                if (isSameDay(new Date(endingDate), new Date(today.setHours(23, 59, 59, 999)))) {
                    localAnnouncement.displayFilters.push("ENDING");
                    const temp = {
                        ...counts,
                        "ending": counts['ending']++,
                    }
                    setCounts(temp);
                }
                if (authUser?.email === localAnnouncement.authorId) {
                    localAnnouncement.displayFilters.push("CREATED");
                    const temp = {
                        ...counts,
                        "created": counts['created']++,
                    }
                    setCounts(temp);
                }

                transformedAnnouncements.push(localAnnouncement);
            });
        }

        let temp = [];
        if (aFilter === 'created') {
            temp = organizeByStartDate(transformedAnnouncements);
        } else {
            temp = sortByClosestToToday(transformedAnnouncements);
        }
        processAnnouncements(temp)

        return temp;
    };

    // Sets viewable announcements to correct filter
    useEffect(() => {
        let filter = 'ALL';
        if (data && aFilter) filter = aFilter.toUpperCase();
        if (data && data.length > 0) {
            const validAnnouncements = data.filter(
                (item): item is Announcement => item !== null
            );

            const tempAnnoncements = organizeAnnouncements(validAnnouncements);
            const filteredAnnouncements: LocalAnnouncement[] = [];

            tempAnnoncements?.forEach(announcement => {
                if (announcement.displayFilters.includes(filter)) {
                    filteredAnnouncements.push(announcement);
                }
            });

            setViewableItems(filteredAnnouncements);
        }
        if (!data) {
            setViewableItems([])
        }
    }, [aFilter, data, isLoading, loading, error])

    function convertAttachToInput(attach: Attach): AttachInput {
        return {
            // Map properties from Attach to AttachInput here
            name: attach.name,
            address: attach.address,
            type: attach.type,
            size: attach.size
            // etc...
        };
    }

    useEffect(() => {
        const transformed = viewableItems.map(item => {
            const { attachments, ...rest } = item;

            return {
                ...rest,
                attachments: attachments?.map((a) => {
                    if (!a) return null;
                    // Assuming you have a conversion function from Attach → AttachInput
                    return [convertAttachToInput(a)];
                }),
            };
        });

        ahook.setAnnouncements(transformed);
    }, [viewableItems]);

    //Triggers SWR to refetch announcements
    const refetchAnnouncements = async () => {
        mutate('announcements')
    }

    //TODO: Move to separate file
    //Skeleton card for when loading announcements
    const SkeletonCard = ({ number }: { number: number }) => {
        return (
            <View style={{ backgroundColor: '#FFFFFF0D', height: 92, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
                {
                    (number % 2) ? (<SkeletonLoader width={50} height={50} borderRadius={12} />) : (<></>)
                }

                <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ paddingRight: '60%' }}>
                        <SkeletonLoader height={22} borderRadius={6} />
                    </View>
                    <View style={{ paddingRight: '30%' }}>
                        <SkeletonLoader height={22} borderRadius={6} />
                    </View>
                </View>
            </View>
        )
    }

    //Delay to show message about announcement content
    useEffect(() => {
        if (counts[aFilter] === 0) {
            const timer = setTimeout(() => {
                setShowMessage(true);
            }, 50); // Delay of 1 second (1000 ms)

            return () => clearTimeout(timer); // Cleanup the timer if the component unmounts or `aFilter` changes
        } else {
            setShowMessage(false);
        }
    }, [counts, aFilter]);

    return (
        <View style={{backgroundColor: colors.background[theme].general, height: '100%'}}>
            {
                Platform.OS === 'ios' && (
                    <>
                        <StatusBar backgroundColor={"transparent"} />
                        <View style={{ height: 50, width: '100%', }} />
                    </>
                )
            }
            {
                Platform.OS === 'android' && (
                    <View style={{ height: 32, width: '100%', }} />
                )
            }
            <FlatList
                data={viewableItems}
                renderItem={({ item, index }) => (
                    <>
                        {
                            viewableItems && viewableItems?.length > 0 ? (
                                <ACard
                                    key={index}
                                    title={item.title}
                                    body={item.body}
                                    author={{ name: item.authorName, picture: item.authorPicture }}
                                    index={index}
                                    id={item.id}
                                    filters={item.displayFilters}
                                    startDate={item.startDate}
                                    endDate={item.endDate * 1000} //Convert back to milliseconds
                                    createdDate={item.createdAt}
                                    sched={item.id === scheduled}
                                    later={item.id === later}
                                    tmrw={item.id === tomorrow}
                                    image={item.path}
                                    aspectRatio={item.aspectRatio}
                                    skip={item.skip} editDetails={{
                                        names: item.editorname,
                                        ids: item.editorId,
                                        times: item.editTime,
                                        forms: item.editType
                                    }} attachments={item.attachments} />
                            ) : (
                                <>
                                    <SkeletonCard number={index} />
                                    <SkeletonCard number={index + 1} />
                                    <SkeletonCard number={index} />
                                    <SkeletonCard number={index + 1} />
                                    <SkeletonCard number={index} />
                                    <SkeletonCard number={index + 1} />
                                    <SkeletonCard number={index} />
                                </>
                            )
                        }
                    </>
                )}
                ListHeaderComponent={
                    <AHeader
                        authUser={authUser}
                        theme={theme}
                        aFilter={aFilter}
                        navigation={navigation}
                        itemLength={viewableItems.length}
                        updateAFilter={updateAFilter}
                    />
                }
                keyExtractor={(item) => item.id.toString()}
                refreshing={loading}
                onRefresh={() => refetchAnnouncements()}
                // refreshControl={
                //     <RefreshControl
                //         refreshing={loading}
                //         onRefresh={() => refetchAnnouncements()}
                //         colors={[colors.text[theme].primary]}
                //         progressBackgroundColor={colors.text[theme].primary} // Customize the background color of the indicator
                //         tintColor={colors.text[theme].primary}
                //     />
                // }
            />
            {
                viewableItems.length === 0 && (
                    //Message for announcement context results (# of announcements)
                    <View style={{
                        position: 'absolute', top: '50%', right: 0, left: 0, transform: [{ translateX: windowWidth % 2 }, { translateY: windowWidth % 2 }],
                        zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <Ionicons name='filter' color={colors.text[theme].secondary} size={60} />
                        <Text style={{ color: colors.text[theme].secondary, textAlign: 'center', width: 'auto', marginHorizontal: 'auto', lineHeight: 26, fontSize: 18, fontFamily: 'Figtree-Bold', marginTop: 12 }}>
                            No announcements here
                        </Text>
                        <Text style={{ color: colors.text[theme].tertiary, fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20 }}>
                            You're all caught up
                        </Text>
                    </View>
                )
            }
        </View>
    )
}

export default HomePage