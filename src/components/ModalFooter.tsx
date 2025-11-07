import React, { ReactNode } from 'react'
import { View, Text, Platform } from 'react-native'
import colors from '../colors';
import { useAuthContext } from '../contexts/AuthContext';

interface ModalFooterProps {
    children: ReactNode;
    label?: string | null;
    errorLabel?: string | null;
    unique: boolean;
    flex?: boolean | null;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, label, errorLabel, unique, flex }) => {
    const { theme } = useAuthContext();

    return (
        <View style={{ backgroundColor: unique ? colors.background[theme].general : colors.background[theme].elevated, paddingBottom: Platform.OS === 'android' ? 20 : 32, }}>
            {/* Variable message */}
            <View style={{ height: 36, display: (errorLabel || label) ? 'flex' : 'none', justifyContent: 'center', borderTopWidth: 1, borderColor: colors.fills[theme].stroke }}>
                {label && <Text maxFontSizeMultiplier={0} style={{ textAlign: 'center', fontSize: 13, lineHeight: 18, fontFamily: 'Figtree-SemiBold', color: '#FFFFFFB2' }} >{label}</Text>}
                {errorLabel && <Text maxFontSizeMultiplier={0} style={{ textAlign: 'center', fontSize: 13, lineHeight: 18, fontFamily: 'Figtree-SemiBold', color: '#FA3E42' }} >{errorLabel}</Text>}
            </View>
            <View style={{ display: 'flex', flexDirection: flex ? 'column' : 'row', position: 'relative' }}>
                {children}
            </View>
        </View>
    )
}

export default ModalFooter