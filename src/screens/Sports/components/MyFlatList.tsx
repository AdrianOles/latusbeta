import React, { useCallback, useState } from 'react';
import { View, Text, RefreshControl, Dimensions } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { LeagueGame } from './LeagueGame';
import colors from '../../../colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface MyFlatListProps {
    data: any[] | null;
    pageIndex: number;
    flatListRefs: React.MutableRefObject<Map<number, { ref: any, scrollY: Animated.SharedValue<number> }>>;
    headerHeight: number;
}

const MyFlatList = React.memo(({
    data,
    pageIndex,
    flatListRefs,
    headerHeight,
}: MyFlatListProps) => {
    const theme = 'light';
    const [refreshing, setRefreshing] = useState(false);

    // ✅ FIX: Each instance of MyFlatList owns its own shared value for scroll position.
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, []);

    const renderItem = useCallback(({ item }: { item: any }) => {
        return (
            <LeagueGame
                league={item.league}
                items={item.games}
                widthScreen={SCREEN_WIDTH}
            />
        );
    }, []);

    const renderEmptyListComponent = () => (
        <View style={{ height: Dimensions.get('window').height / 2, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 18, color: colors.text[theme].secondary }}>
                {pageIndex === 0 ? "No games scheduled for Sunday" :
                    pageIndex === 6 ? "No games scheduled for Saturday" :
                        "No games scheduled for today"}
            </Text>
        </View>
    );

    return (
        <Animated.FlatList
            ref={(ref: any) => {
                if (ref) {
                    // ✅ FIX: Store both the ref and the local scrollY shared value in the map.
                    flatListRefs.current.set(pageIndex, { ref, scrollY });
                } else {
                    flatListRefs.current.delete(pageIndex);
                }
            }}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.league || `league_${index}`}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            style={{ width: SCREEN_WIDTH }}
            contentContainerStyle={{
                paddingTop: headerHeight,
                paddingBottom: 40,
                paddingHorizontal: 16
            }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={headerHeight} />
            }
            ListEmptyComponent={renderEmptyListComponent}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={11}
            removeClippedSubviews={true}
        />
    );
});
