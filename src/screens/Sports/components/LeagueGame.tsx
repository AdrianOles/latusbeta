// Outside of your Testrun component, ideally in its own file (e.g., GameCard.tsx)
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigation';
import { asLogo, stfxLogo } from '../../../../assets';
import colors from '../../../colors';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { GameCard } from './GameCard';
import { school } from '..';
import { FlashList, FlashListProps } from '@shopify/flash-list';
interface gameType {
    date?: string;
    league?: string;
    location?: string;
    notes: string;
    home: {
        name: string;
        score: number | null;
    };
    visitor: {
        name: string;
        score: number | null;
    };
    time?: string
}

const reorderString = (inputString: string): string => {
    if (!inputString || typeof inputString !== 'string') {
        return '';
    }
    const words = inputString.split(' ');

    if (words.length <= 1) {
        return inputString;
    }
    const lastWord = words.pop();
    const remainingWords = words.join(' ');

    return `${lastWord} - ${remainingWords}`;
};

/**
 * Determines the outcome of a series of games for a specific team.
 * @param games An array of game objects.
 * @param teamName The name of the team to check results for.
 * @returns An array of strings, where each string is 'W', 'L', or 'D'.
 */
const getResultsForTeam = (games: gameType[], teamName: string): string[] => {
    const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const targetTeam = normalize(teamName);

    return games && games.map((game) => {
        const homeTeam = normalize(game.home.name);
        const visitorTeam = normalize(game.visitor.name);

        if (homeTeam === targetTeam) {
            const homeScore = game.home.score || 0;
            const visitorScore = game.visitor.score || 0;
            if (homeScore > visitorScore) {
                return 'W';
            } else if (homeScore < visitorScore) {
                return 'L';
            } else {
                return 'D';
            }
        }
        // Check if the team is the visitor team
        else if (visitorTeam === targetTeam) {
            const homeScore = game.home.score || 0;
            const visitorScore = game.visitor.score || 0;
            if (visitorScore > homeScore) {
                return 'W';
            } else if (visitorScore < homeScore) {
                return 'L';
            } else {
                return 'D';
            }
        }
        // If the team is not in the game, return a placeholder
        else {
            return 'O';
        }
    });
};

export const abbreviateRank = (inputString: string): string => {
    if (!inputString) {
        return inputString;
    }

    // 1. Convert "Junior" to "Jr."
    // The 'gi' flags make the search global (g) and case-insensitive (i).
    let result = inputString.replace(/junior/gi, 'Jr.');

    // 2. Convert "Senior" to "Sr."
    // We apply this to the result of the first replacement.
    result = result.replace(/senior/gi, 'Sr.');

    return result;
}

const LeagueGameComponent = React.memo(({ league, items, widthScreen, teamName, mode, date }: { date?: string, league?: string, items: gameType[], widthScreen: number, teamName: school, mode?: "league" | "team" | "game" | 'school' }) => {
    const navigation = useNavigation<HomeStackParamList>(); // If GameCard needs navigation
    const { theme } = useAuthContext();
    //Remove stroke for the last GameCard
    const leagueToUse = abbreviateRank(league || '');

    console.log(items)

    const handlePress = () => {
        if (mode != 'league' && mode != 'team') {
            navigation.navigate("SportsLeague", {
                league: league,
                org: 'HCAA'
            })
        } else {
            return null;
        }
    }

    const results = React.useMemo(() => getResultsForTeam(items, teamName), [items, teamName]);
    
    const renderGameCard = ({ item, index }: { item: gameType, index: number }) => {
        const isLastItem = index === (items.length - 1);
        return (
            <GameCard
                mode={mode}
                dateString={date}
                date={item.date}
                time={item.time}
                format={mode === 'game' || mode === 'school' ? results[index] as "W" | "L" | "D" : undefined}
                remove={isLastItem}
                key={index} // key property is still important, although FlatList uses keyExtractor
                item={item}
                widthScreen={widthScreen - 32}
                lpadding={16}
                league={item.league}
                teamName={teamName}
            />
        );
    };

    return (
        <View style={{
            display: 'flex', borderRadius: 16, overflow: 'hidden', borderWidth: 0, marginBottom: 16,
            borderColor: colors.fills[theme].stroke,
        }}>
            <TouchableOpacity onPress={handlePress} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 16}}>
                {/* {mode === 'game' && (<Ionicons name='football-outline' size={24} style={{ paddingRight: 8 }} color={colors.text[theme].primary} />)} */}
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: 'Figtree-Bold', fontSize: 18, lineHeight: 20, color: colors.text[theme].primary }}>{mode === 'game' && leagueToUse ? reorderString(leagueToUse) : leagueToUse}</Text>
                {mode === 'game' && (<Ionicons name='chevron-forward-outline' color={colors.text[theme].primary} style={{ paddingLeft: 2 }} />)}
            </TouchableOpacity>

            <View style={{ backgroundColor: colors.background[theme].elevated, boxShadow: '0px 2px 24px 0px #73708014', borderRadius: 20 }}>
                {items.map((game, index) => (
                    <GameCard
                        key={`game-${league}-${index}`} // Ensure unique key
                        item={game}
                        widthScreen={widthScreen} // Adjust width if padding exists in parent
                        teamName={teamName}
                        mode={mode}
                        date={mode === 'school' ? game.league : game.date} // Assuming logic based on your snippet
                        dateString={date}
                        time={game.time} // Assuming game object has time
                        remove={index === items.length - 1} // Remove divider for last item
                    />
                ))}
            </View>
        </View>
    );
});

export const LeagueGame = React.memo(LeagueGameComponent);