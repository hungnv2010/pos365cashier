import React from 'react';
import { View } from 'react-native';
import Order from './order/Order';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import I18n from '../../common/language/i18n';

export default (props) => {
  return (
    <View style={{ flex: 1 }}>
      <ToolBarDefault
        navigation={props.navigation}
        title={`${I18n.t('chuyen')} ${I18n.t('tu')} ${props.route.params.Name} ${I18n.t('den')} ...`}
        leftIcon="keyboard-backspace"
        clickLeftIcon={() => { props.navigation.goBack() }} />
      <Order {...props} ></Order>
    </View>
  );
};
