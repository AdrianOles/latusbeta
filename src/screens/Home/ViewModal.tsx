import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Button, FlatList, Dimensions, Animated, PanResponder, Platform, TouchableOpacity, StyleSheet, Image, Pressable, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSWR, { mutate, Cache, SWRResponse } from 'swr';
import useAnnouncements, { AnnouncementTransformed } from '../../hooks/useAnnouncements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUrl } from 'aws-amplify/storage';
import { useAuthContext } from '../../contexts/AuthContext';
import colors from '../../colors';
import { Announcement } from '../../API';
import { HomeStackParamList } from '../../navigation';
import { LinearGradient } from 'expo-linear-gradient';
import ViewCard from './components/ViewCard';

const windowHeight = Dimensions.get('window').height;
type ModalScreenRouteProp = RouteProp<HomeStackParamList, 'ViewModal'>;

interface modalCardProps {
    title: string;
    body: string;
    picture?: {
        path: string;
        aspectRatio: string;
    };
}

const ViewModal = () => {
    const navigation = useNavigation<HomeStackParamList>();
    const [scrollPosition, setScrollPosition] = useState(0);
    const route = useRoute<ModalScreenRouteProp>();
    const { id } = route.params;
    const [counter, setCounter] = useState<number>(0);
    const ahook = useAnnouncements();
    const [imageUrls, setImageUrls] = useState<(string | undefined)[]>();
    const [loading, setLoading] = useState(false);
    const { schoolColor, theme } = useAuthContext();

    useEffect(() => {
        setCounter(id);
    }, [id])

    const ShapeLayer = () => {
        return (
            <View style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -3 }}>
                <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <LinearGradient
                        colors={[schoolColor, 'transparent']}
                        style={{ height: 400, width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                    />
                </View>
            </View>
        )
    }

    const ShapeOverlay = () => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    {/* <BlurView intensity={100} tint='dark' style={{ width: '100%', height: '100%', backgroundColor: '#0000008C', position: 'absolute', top: 0, left: 0, zIndex: -2 }} /> */}
                </>
            )
        }
    }

    const goBack = () => {
        if (ahook.announcements) {
            if (counter === 0) {
                setCounter(ahook.announcements.length - 1)
            }
            if (counter > 0) {
                setCounter(counter - 1)
            }
        }
    }

    const goNext = () => {
        if (ahook.announcements) {
            if (counter === (ahook.announcements.length - 1)) {
                setCounter(0)
            }
            if (counter < (ahook.announcements.length - 1)) {
                setCounter(counter + 1)
            }
        }
    }

    return (
        <>
            {
                ahook.announcements && ahook.announcements.length > 0 ? (
                    <View style={{ backgroundColor: colors.background[theme].elevated, position: 'relative', width: '100%', }}>
                        <View style={{ width: '100%', position: 'relative', minHeight: windowHeight, height: '100%', }}>
                            {/* <ShapeLayer />
              <ShapeOverlay /> */}

                            {/* This will be the card? */}
                            {
                                ahook.announcements && ahook.announcements?.length > 0 && ahook.announcements.map((item: AnnouncementTransformed, index) => (
                                    <ViewCard goBack={goBack} goNext={goNext} key={index} index={index} title={item.title} body={item.body} endDate={Math.floor(new Date(item.endDate * 1000).getTime() / 1000)} counter={counter} author={{ name: item.authorName, picture: item.authorPicture }}
                                    path={item.path} aspectRatio={item.aspectRatio} startDate={new Date(item.startDate)} createdDate={new Date(item.createdAt)} skip={item.skip} attachments={item.attachments ? item.attachments.flat() : null} filterLabel={ahook.filterState}                                    />
                                ))
                            }

                            {/* Close button */}
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: Platform.OS === 'ios' ? 44 : 0, right: 0, zIndex: 2, paddingHorizontal: 16, paddingVertical: 16 }}>
                                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 36, aspectRatio: 1, backgroundColor: theme === 'light' ? '#83818C1F' : '#FFFFFF1F', borderRadius: 250, paddingLeft: 1 }}>
                                    <Ionicons name={'close-outline'} size={24} color={colors.text[theme].primary}></Ionicons>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text style={{ color: '#FFF' }}>Hello</Text>
                    </View>
                )
            }
        </>
    )
}

export default ViewModal