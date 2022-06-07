import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import styles from '../styles';

export default ({ children, style }) => {
  let s;
  if (typeof style === 'undefined') {
    s = styles.defaultContainer;
  } else {
    s = style;
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s}
    >
      <View style={styles.gutterWrapper}>{children}</View>
    </KeyboardAvoidingView>
  );
};
