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

interface gameType {
    date?: string;
    league: string | undefined | null;
    location: string;
    notes: string;
    home: {
        name: string;
        score: number;
    };
    visitor: {
        name: string;
        score: number;
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
    return games.map((game) => {
        // Check if the team is the home team
        if (game.home.name === teamName) {
            if (game.home.score > game.visitor.score) {
                return 'W';
            } else if (game.home.score < game.visitor.score) {
                return 'L';
            } else {
                return 'D';
            }
        }
        // Check if the team is the visitor team
        else if (game.visitor.name === teamName) {
            if (game.visitor.score > game.home.score) {
                return 'W';
            } else if (game.visitor.score < game.home.score) {
                return 'L';
            } else {
                return 'D';
            }
        }
        // If the team is not in the game, return a placeholder
        else {
            return '';
        }
    });
};

const LeagueGameComponent = React.memo(({ league, items, widthScreen, teamName, mode }: { league: string, items: gameType[], widthScreen: number, teamName: school, mode?: "league" | "team" | "game" }) => {
    const navigation = useNavigation<HomeStackParamList>(); // If GameCard needs navigation
    const { theme } = useAuthContext();

    //Remove stroke for the last GameCard

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

    const results = getResultsForTeam(items, teamName);


    return (
        <View style={{
            display: 'flex', borderRadius: 16, overflow: 'hidden', borderWidth: 0, marginBottom: 16,
            borderColor: colors.fills[theme].stroke, boxShadow: '0px 1px 24px rgba(51, 51, 51, 0.16)'
        }}>
            <TouchableOpacity onPress={handlePress} style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
                backgroundColor: theme === 'light' ? '#F5F5F7' : colors.fills[theme].standard
            }}>
                {!mode && (<Ionicons name='football-outline' size={24} style={{ paddingRight: 8 }} color={colors.text[theme].primary} />)}
                <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 15, lineHeight: 18, color: colors.text[theme].primary }}>{mode ? league : reorderString(league)}</Text>
                {!mode && (<Ionicons name='chevron-forward-outline' color={colors.text[theme].primary} style={{ paddingLeft: 2 }} />)}
            </TouchableOpacity>
            <View style={{ backgroundColor: colors.background[theme].elevated}}>
                {
                    items.map((game, index) => (
                        <GameCard mode={mode} date={game.date} time={league === 'Upcoming Games' ? game.time : undefined} format={mode === 'team' ? results[index] as "W" | "L" | "D" : undefined} remove={index === (items.length - 1) ? true : false} key={index} item={game} widthScreen={widthScreen - 32} lpadding={16} />
                    ))
                }
            </View>
        </View>
    );
});

export const LeagueGame = React.memo(LeagueGameComponent);