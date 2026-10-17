import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView, Alert, Dimensions, Platform, PixelRatio } from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';
import { useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot';
import Share, { ShareSingleOptions, Social } from 'react-native-share';
import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation';
import { MeshGradientView } from 'expo-mesh-gradient';
import { school } from '.';
import SimpleBox from './components/sharing/SimpleBox';
import HorizontalBox from './components/sharing/HorizontalBox';
import StackText from './components/sharing/StackText';
import SimpleBoxStory from './components/sharing/SimpleBoxStory';
import HorizontalBoxStory from './components/sharing/HorizontalBoxStory';
import StackTextStory from './components/sharing/StackTextStory';

type GameRouteProp = RouteProp<HomeStackParamList, 'ShareGame'>;

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

export type CardMove = {
    top?: number,
    bottom?: number,
    right?: number,
    left?: number
}

const INTERVAL = 24;

interface ImageCardProps {
    selectedImageUri: string;
    children: ReactNode;
    containerHeight: number;
    calculatedWidth: number;
}

// No changes needed for ImageCard
const ImageCard: React.FC<ImageCardProps> = React.memo(({ selectedImageUri, children, containerHeight, calculatedWidth }) => {
    return (
        <View style={{ height: containerHeight, width: calculatedWidth, borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
            <Image
                source={{ uri: selectedImageUri }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Changed to cover for better aesthetics
                resizeMode="cover"
            />
            {children}
        </View>
    );
});


const SharegameStory = () => {
    const { theme } = useAuthContext();
    const navigation = useNavigation();
    // 1. Initialize a ref to hold an array of ViewShot refs
    const viewShotRefs = useRef<(ViewShot | null)[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [activeIndex, setActiveIndex] = useState(0);
    // const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const [pos, setPos] = useState<number>(1);
    const [move, setMove] = useState<CardMove>({
        top: undefined, bottom: 16, right: 16, left: undefined
    });
    const route = useRoute<GameRouteProp>();
    const {
        org,
        mode,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore
    }: {
        org: string, mode: "Story" | "Post", homeTeam: string, awayTeam: string, homeScore: string, awayScore: string
    } = route.params;

    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    // This array defines the content for each card, making the JSX cleaner
    const cardDataOg = [
        { Component: SimpleBox, props: { variant: false } },
        { Component: SimpleBox, props: { variant: true } },
        { Component: HorizontalBox, props: { variant: true } },
        { Component: HorizontalBox, props: { variant: false, needsGradient: true } },
        { Component: StackText, props: { variant: false, needsGradient: true } },
    ];

    const cardData = [
        { Component: SimpleBoxStory, props: { variant: false } },
        { Component: SimpleBoxStory, props: { variant: true } },
        { Component: HorizontalBoxStory, props: { variant: true } },
        { Component: HorizontalBoxStory, props: { variant: false, needsGradient: true } },
        { Component: StackTextStory, props: { variant: false, needsGradient: true } },
    ];

    const pickImage = async (mode: "Post" | "Story") => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: mode === 'Post' ? true : false,
            quality: 1,
            aspect: mode === 'Post' ? [1, 1] : undefined, // Enforce square aspect ratio for posts
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setSelectedImageUri(uri);
            Image.getSize(uri, (width, height) => {
                setImageDimensions({ width, height });
            });
        }
    };

    const STORY_ASPECT_RATIO = 9 / 16; // width / height
    const maxHeight = SCREEN_HEIGHT < 650 ? 320 : 420;
    const containerHeight = maxHeight;
    const calculatedWidth = containerHeight * STORY_ASPECT_RATIO;

    const handleScroll = React.useCallback((event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
        // The width of a single item including its margin/padding for snapping
        const itemWidth = calculatedWidth + 24;
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / itemWidth);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    }, [calculatedWidth, activeIndex]);

    // const shareToInstagramAsPost = async () => {
    //     try {
    //         if (!selectedImageUri) {
    //             Alert.alert('No Image', 'Please select a background image first.');
    //             return;
    //         }

    //         const activeViewShotRef = viewShotRefs.current[activeIndex];
    //         if (!activeViewShotRef || typeof activeViewShotRef.capture !== 'function') {
    //             Alert.alert('Error', 'Component not ready. Please try again.');
    //             return;
    //         }

    //         // Capture the view with the higher resolution
    //         const uri = await activeViewShotRef.capture();
    //         // console.log("Capured: ", uri)

    //         // The rest of the function remains the same...
    //         const { status } = await MediaLibrary.requestPermissionsAsync();
    //         if (status !== 'granted') {
    //             Alert.alert('Permission Denied', 'We need permission to save the image to your photo library to share it.');
    //             return;
    //         }

    //         const backgroundBase64 = await FileSystem.readAsStringAsync(selectedImageUri, {
    //             encoding: FileSystem.EncodingType.Base64,
    //         });

    //         const shareOptions: ShareSingleOptions = {
    //             backgroundImage: `data:image/jpeg;base64,${backgroundBase64}`,
    //             stickerImage: `data:image/png;base64,${uri}`,
    //             backgroundBottomColor: '#fefefe',
    //             backgroundTopColor: '#906df4',
    //             social: Share.Social.INSTAGRAM_STORIES as Social,
    //             appId: '1433567004455755' // required since  Jan 2023 (see: https://developers.facebook.com/docs/instagram/sharing-to-stories/#sharing-to-stories)
    //         };

    //         await Share.shareSingle(shareOptions);
    //     } catch (error: any) {
    //         if (error.message.includes("User did not share")) {
    //             console.log("Share cancelled by user.");
    //         } else {
    //             console.error("An error occurred during sharing:", error);
    //             Alert.alert('Failed to share', `An error occurred: ${error.message || 'Unknown error'}`);
    //         }
    //     } finally {
    //     }
    // };

    // const downloadImage = async () => {
    //     let savedAsset: MediaLibrary.Asset | null = null;

    //     try {
    //         if (!selectedImageUri) {
    //             Alert.alert('No Image', 'Please select a background image first.');
    //             return;
    //         }

    //         const activeViewShotRef = viewShotRefs.current[activeIndex];
    //         if (!activeViewShotRef || typeof activeViewShotRef.capture !== 'function') {
    //             Alert.alert('Error', 'Component not ready. Please try again.');
    //             return;
    //         }

    //         // Capture the view with the higher resolution
    //         const uri = await activeViewShotRef.capture();

    //         // The rest of the function remains the same...
    //         const { status } = await MediaLibrary.requestPermissionsAsync();
    //         if (status !== 'granted') {
    //             Alert.alert('Permission Denied', 'We need permission to save the image to your photo library to share it.');
    //             return;
    //         }

    //         savedAsset = await MediaLibrary.createAssetAsync(uri);
    //         if (!savedAsset?.uri) {
    //             throw new Error("Failed to save image to gallery.");
    //         } else {
    //             Alert.alert('Saved', 'You successfully saved the image to your camera roll.');
    //             Haptics.notificationAsync(
    //                 Haptics.NotificationFeedbackType.Success
    //             )
    //         }
    //     } catch (error: any) {
    //         if (error.message.includes("User did not share")) {
    //             console.log("Share cancelled by user.");
    //         } else {
    //             console.error("An error occurred during sharing:", error);
    //             Alert.alert('Failed to share', `An error occurred: ${error.message || 'Unknown error'}`);
    //         }
    //     }
    // }

    useEffect(() => {
        switch (pos) {
            case 1: setMove({ bottom: INTERVAL, right: INTERVAL }); break;
            case 2: setMove({ bottom: INTERVAL, left: INTERVAL }); break;
            case 3: setMove({ top: INTERVAL, left: INTERVAL }); break;
            case 4: setMove({ top: INTERVAL, right: INTERVAL }); break;
        }
    }, [pos]);

    const changePos = () => {
        setPos(prevPos => (prevPos === 4 ? 1 : prevPos + 1));
    }

    const decideText = () => {
        switch (pos) {
            case 1: return "Bottom Right";
            case 2: return "Bottom Left";
            case 3: return "Top Left";
            case 4: return "Top Right";
        }
    }
    
    return (
        <SafeAreaView edges={["bottom"]} style={{ flex: 1, paddingTop: 96, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: colors.background[theme].elevated }}>
            <View style={{ position: 'absolute', top: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 16, paddingBottom: 8 }}>
                <View>
                    <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 22, color: colors.text[theme].primary }}>{mode} Preview</Text>
                    {selectedImageUri && (
                        <TouchableOpacity onPress={() => pickImage(mode)} style={{
                            display: 'flex', flexDirection: 'row', alignItems: 'center'
                        }}>
                            <Text style={{ color: colors.system[theme].blue, fontFamily: "Figtree-SemiBold", fontSize: 17, lineHeight: 21, marginRight: 4 }}>Change image</Text>
                            <Ionicons size={16} name='swap-horizontal-outline' color={colors.system[theme].blue} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, backgroundColor: colors.fills[theme].standard, borderRadius: 250 }}>
                    <Ionicons name='close-outline' size={28} color={colors.text[theme].primary} />
                </TouchableOpacity>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    style={{ paddingLeft: 48 }} // Use paddingLeft instead of paddingHorizontal
                    contentContainerStyle={{ paddingRight: 24 }} // Add padding to the end of the content
                    scrollEnabled={!!selectedImageUri}
                    snapToInterval={(calculatedWidth + 48)} // Snap to item width + margin
                    snapToAlignment='start'
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {!selectedImageUri && (
                        <TouchableOpacity onPress={() => pickImage(mode)} style={{
                            borderWidth: 4, borderColor: colors.fills[theme].stroke,
                            justifyContent: 'center', alignItems: 'center', height: mode === 'Story' ? 428 : (SCREEN_WIDTH - 48), width: mode === 'Story' ? 250 : (SCREEN_WIDTH - 48), borderRadius: 24
                        }}>
                            <Ionicons name='image-outline' size={50} color={colors.text[theme].secondary} />
                            <Text style={{ textAlign: 'center', marginTop: 10, color: colors.text[theme].secondary, fontFamily: 'Figtree-SemiBold' }}>Tap to add image</Text>
                        </TouchableOpacity>
                    )}
                    {selectedImageUri && imageDimensions.height > 0 && (
                        // 3. Map over the card data to render ViewShot-wrapped cards
                        cardDataOg.map((card, index) => (
                            <View key={index} style={{ marginRight: 48 }}>
                                <ImageCard
                                    selectedImageUri={selectedImageUri}
                                    containerHeight={containerHeight}
                                    calculatedWidth={calculatedWidth}
                                >
                                        <card.Component
                                            {...card.props}
                                            move={move}
                                            game={{ homeTeam, awayTeam, homeScore, awayScore }}
                                        />
                                </ImageCard>
                            </View>
                        ))
                    )}
                </ScrollView>

                <View style={{ opacity: 0, position: 'absolute', width: activeIndex > 1 ? 210 : 200, height: activeIndex > 1 ? 60 : 200 }}>
                    {
                        selectedImageUri && cardData.map((card, index) => (
                            <ViewShot
                                ref={el => {
                                    if (viewShotRefs.current) {
                                        viewShotRefs.current[index] = el;
                                    }
                                }}
                                options={{ format: 'png', quality: 1.0, result: 'base64' }}
                                key={index}
                                style={{ marginRight: 24, position: 'relative', width: '100%', height: '100%' }}
                            >
                                <card.Component
                                    {...card.props}
                                    move={move}
                                    game={{ homeTeam, awayTeam, homeScore, awayScore }}
                                />
                            </ViewShot>
                        ))
                    }
                </View>

                {selectedImageUri && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
                        {cardData.map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    height: 8,
                                    width: 8,
                                    borderRadius: 5,
                                    opacity: index === activeIndex ? 1 : 0.3,
                                    backgroundColor: colors.text[theme].primary,
                                    marginHorizontal: 5,
                                }}
                            />
                        ))}
                    </View>
                )}

                {selectedImageUri && mode === 'Post' && (
                    <TouchableOpacity onPress={changePos} style={{
                        marginTop: 32, borderColor: colors.fills[theme].stroke, justifyContent: 'center', paddingVertical: 12, width: 180,
                        borderWidth: 1, borderRadius: 250, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16
                    }}>
                        <Ionicons size={20} name='move-outline' style={{ marginRight: 8 }} color={colors.text[theme].secondary} />
                        <Text style={{ fontSize: 17, fontFamily: 'Figtree-SemiBold', lineHeight: 22, color: colors.text[theme].secondary }}>
                            {decideText()}
                        </Text>
                    </TouchableOpacity>
                )}

            </View>

            <View style={{
                borderTopColor: colors.fills[theme].stroke, borderTopWidth: 1,
                paddingTop: 16, paddingHorizontal: 32, paddingBottom: 16, opacity: selectedImageUri ? 1 : 0.5
            }}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ flex: 1, marginRight: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* <TouchableOpacity onPress={shareToInstagramAsPost} disabled={!selectedImageUri} style={{
                            borderRadius: 250, marginBottom: 8, overflow: 'hidden',
                            justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%'
                        }}>
                            <Ionicons name='logo-instagram' size={28} color={'white'} style={{ zIndex: 1, padding: 12 }} />
                            <LinearGradient
                                colors={['#d62976', '#fa7e1e',]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{ position: 'absolute', zIndex: 0, width: '100%', height: '100%' }}
                            />
                        </TouchableOpacity> */}
                        <Text style={{ fontSize: 13, lineHeight: 18, fontFamily: "Figtree-SemiBold", textAlign: 'center', color: colors.text[theme].secondary }}>Story</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* <TouchableOpacity onPress={downloadImage} disabled={!selectedImageUri} style={{
                            borderRadius: 250, marginBottom: 8, overflow: 'hidden', backgroundColor: colors.fills[theme].standard,
                            justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%'
                        }}>
                            <Ionicons name='download-outline' size={28} color={colors.text[theme].primary} style={{ zIndex: 1, padding: 12 }} />
                        </TouchableOpacity> */}
                        <Text style={{ fontSize: 13, lineHeight: 18, fontFamily: "Figtree-SemiBold", textAlign: 'center', color: colors.text[theme].secondary }}>Save</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default SharegameStory;
