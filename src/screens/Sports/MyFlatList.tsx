import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import colors from '../../colors';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation';
import { Extrapolate, interpolate, runOnJS, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { GameCard } from './components/GameCard';
import { AuthUserType } from '../../contexts/AuthContext';
import { gameType } from '../../types/Games';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const HEADER_MAX_HEIGHT = 182;
const REFRESH_THRESHOLD = 60;
const MAX_REFRESH_PULL_HEIGHT = 120;
const REFRESH_ACTIVE_HEIGHT = 50;
const theme = 'light'; // Or derive from props/context if needed

// --- REFRESH HEADER COMPONENT (UNCHANGED) ---
const RefreshHeader = ({ animatedHeaderSpacerStyle, animatedRefreshIndicatorStyle, showSpinner }: any) => {
    const spinnerStyle = useAnimatedStyle(() => ({
        opacity: showSpinner.value ? 1 : 0,
        position: 'absolute',
    }));
    const arrowStyle = useAnimatedStyle(() => ({
        opacity: showSpinner.value ? 0 : 1,
    }));
    return (
        <Animated.View style={[animatedHeaderSpacerStyle, { position: 'absolute', justifyContent: 'flex-end', alignItems: 'center', top: -200, width: SCREEN_WIDTH }]}>
            <Animated.View style={animatedRefreshIndicatorStyle}>
                <View style={{ height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}>
                    <Animated.View style={spinnerStyle}>
                        <ActivityIndicator size="small" color={colors.text[theme].primary} />
                    </Animated.View>
                    <Animated.View style={arrowStyle}>
                        <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: colors.background[theme].general, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="arrow-down" size={24} color={colors.text[theme].primary} />
                        </View>
                    </Animated.View>
                </View>
            </Animated.View>
        </Animated.View>
    );
};


// --- PROPS INTERFACE FOR MyFlatList ---
interface MyFlatListProps {
    games: gameType[];
    isLoading: boolean;
    pageIndex: number;
    authUser: AuthUserType | null;
    scrollY: SharedValue<number>;
    customRefreshHeight: SharedValue<number>;
    isUiLoading: SharedValue<boolean>;
    flatListRefs: React.MutableRefObject<Map<any, any>>;
    syncTabs: (sourceIndex: number, offset: number) => void;
    startRefresh: () => void;
}

// --- MAIN LIST COMPONENT ---
const MyFlatList = ({
    games,
    isLoading,
    pageIndex,
    authUser,
    scrollY,
    customRefreshHeight,
    isUiLoading,
    flatListRefs,
    syncTabs,
    startRefresh,
}: MyFlatListProps) => {
    const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<gameType>);
    const navigation = useNavigation<HomeStackParamList>();

    // All your animation and scroll handling logic remains unchanged.
    // It correctly uses the shared values passed down as props.
    const animatedHeaderSpacerStyle = useAnimatedStyle(() => {
        const clampedRefreshHeight = interpolate(customRefreshHeight.value, [0, REFRESH_THRESHOLD, MAX_REFRESH_PULL_HEIGHT], [0, REFRESH_THRESHOLD, MAX_REFRESH_PULL_HEIGHT], Extrapolate.CLAMP);
        const currentActiveHeight = isUiLoading.value ? REFRESH_ACTIVE_HEIGHT : clampedRefreshHeight;
        return { height: HEADER_MAX_HEIGHT + currentActiveHeight };
    });

    const animatedRefreshIndicatorStyle = useAnimatedStyle(() => {
        const pullDistance = customRefreshHeight.value;
        return {
            opacity: interpolate(pullDistance, [0, REFRESH_THRESHOLD], [0, 1], Extrapolate.CLAMP),
            transform: [{ scale: interpolate(pullDistance, [0, REFRESH_THRESHOLD], [0.5, 1], Extrapolate.CLAMP) }],
        };
    });

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const y = event.contentOffset.y;
            scrollY.value = Math.max(0, y);
            if (y < 0) {
                customRefreshHeight.value = Math.abs(y);
            } else {
                customRefreshHeight.value = 0;
            }
        },
        onEndDrag: (event) => {
            if (customRefreshHeight.value >= REFRESH_THRESHOLD) {
                runOnJS(startRefresh)();
            } else {
                customRefreshHeight.value = withSpring(0);
            }
            runOnJS(syncTabs)(pageIndex, Math.max(0, event.contentOffset.y));
        },
        onMomentumEnd: (event) => {
            if (customRefreshHeight.value > 0 && !isUiLoading.value) {
                customRefreshHeight.value = withSpring(0);
            }
            runOnJS(syncTabs)(pageIndex, Math.max(0, event.contentOffset.y));
        }
    });

    const renderItem = useCallback(({ item }: { item: gameType }) => (
        <>
            {item.league && (
                <TouchableOpacity onPress={() => navigation.navigate("SportsLeague")} style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', paddingBottom: 12, borderColor: colors.fills[theme].stroke, borderBottomWidth: 1, paddingTop: 48 }}>
                    <Text style={{ color: colors.text[theme].primary, paddingLeft: 16, marginHorizontal: 4, fontFamily: 'Figtree-Bold', fontSize: 17, lineHeight: 21 }}>{item.league}</Text>
                    <Ionicons name='chevron-forward-outline' size={24} />
                </TouchableOpacity>
            )}
            <GameCard widthScreen={SCREEN_WIDTH} item={item} />
        </>
    ), [theme, navigation]);

    // --- CONDITIONAL RENDERING ---
    // 1. Show a full-screen loader while fetching data for the first time.
    if (isLoading && games.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: HEADER_MAX_HEIGHT - 140 }}>
                <ActivityIndicator size="large" color={colors.text[theme].primary} />
            </View>
        );
    }

    // 2. Show the list, which can handle its own empty state or display the games.
    return (
        <AnimatedFlatList
            data={games}
            renderItem={renderItem}
            ref={(ref: any) => { if (ref) flatListRefs.current.set(pageIndex, ref); }}
            keyExtractor={(item, index) => `${item.notes}-${item.home.score}-${item.home.name}-${index}`}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            ListHeaderComponent={() => (
                <RefreshHeader
                    animatedHeaderSpacerStyle={animatedHeaderSpacerStyle}
                    animatedRefreshIndicatorStyle={animatedRefreshIndicatorStyle}
                    showSpinner={isUiLoading}
                />
            )}
            ListEmptyComponent={() => (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: SCREEN_HEIGHT / 2 }}>
                    <Text style={{ color: colors.text[theme].secondary, fontSize: 16, fontFamily: 'Figtree-SemiBold' }}>No Games Scheduled</Text>
                </View>
            )}
            // Optimization props
            contentContainerStyle={{ paddingTop: authUser ? 180 : 200, paddingBottom: 200 }}
            removeClippedSubviews={true}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
        />
    );
};

export default MyFlatList;