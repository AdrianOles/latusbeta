import React, { useEffect, useState } from 'react'
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native'
import { useAuthContext } from '../contexts/AuthContext';
import colors from '../colors';

interface ModalButtonProps {
    state: 'proceed' | "second" | 'unfill' | 'disabled';
    disabled: boolean;
    onPress: () => void;
    label: string;
    loadingIndicator: boolean;
    newColor?: string;
    announcement: boolean;
    green?: boolean;
    grow?: boolean;
}

const ModalButton: React.FC<ModalButtonProps> = ({ state, disabled, onPress, label, loadingIndicator, newColor, announcement, green, grow }) => {
    const { theme } = useAuthContext();
    const [proceed, setProceed] = useState<boolean>(false);
    const [second, setSecond] = useState<boolean>(false);
    const [unfill, setUnfill] = useState<boolean>(false);
    const [block, setBlock] = useState<boolean>(false);
    const [backgroundColor, setBackgroundColor] = useState<string>(colors.text[theme].primary);
    const [textColor, setTextColor] = useState<string>(colors.text[theme].primary)

    useEffect(() => {
        switch (state) {
            case 'proceed':
                setProceed(true);
                setBackgroundColor(colors.text[theme].primary)
                setTextColor(colors.background[theme].general)
                break;
            case 'second':
                setSecond(true);
                setBackgroundColor(theme === 'dark' ? '#FFFFFF0D' : '#0000000D');
                if (newColor) setTextColor(newColor);
                break;
            case 'unfill':
                setUnfill(true);
                setBackgroundColor("transparent")
                setTextColor(colors.text[theme].primary)
                break;
            case 'disabled':
                setBlock(true);
                setBackgroundColor(colors.text[theme].tertiary)
                break;
            default:
                setBlock(true);
                setBackgroundColor(colors.text[theme].tertiary)
                break;
        }
    }, [state])

    return (
        <TouchableOpacity disabled={disabled} onPress={onPress}
            style={{
                backgroundColor: backgroundColor,
                borderRadius: 32,
                paddingVertical: 16,
                opacity: (disabled || block) ? 0.5 : 1,
                width: announcement ? '100%' : 'auto',
                flexGrow: grow ? 1 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <View style={{ width: 100 }}>
                {
                    (disabled && loadingIndicator) ? (
                        <ActivityIndicator size={'small'} color={newColor ? '#FA3E42' : green ? '#1BCC64' : proceed ? '#FFF' : '#000'} />
                    ) : (
                        <Text style={{
                            fontSize: 17, lineHeight: 22, fontFamily: 'Figtree-SemiBold', textAlign: 'center',
                            color: textColor,
                        }}>
                            {label}
                        </Text>
                    )
                }
            </View>
        </TouchableOpacity>
    )
}

export default ModalButton