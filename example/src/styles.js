import { StyleSheet } from 'react-native';

export const constants = {
  white: '#FFFFFF',
  black: '#000000',
  darkBlue: '#000088',
  lightBlue: '#0000DD',
};

export default StyleSheet.create({
  buttonContainer: {
    width: '100%',
    backgroundColor: constants.darkBlue,
    color: constants.white,
  },
  mainButton: {
    fontFamily: 'sans-serif',
    fontSize: 15,
    fontWeight: 'bold',
    fontStyle: 'normal',
    lineHeight: 47,
    letterSpacing: 0,
    textAlign: 'left',
    marginLeft: 14,
    color: constants.white,
  },
  screen: {
    flex: 1,
    padding: 24,
  },
  gutterWrapper: {
    flexDirection: 'column',
    flex: 1,
    padding: 25,
  },
  defaultContainer: {
    flex: 1,
    backgroundColor: constants.white,
  },
  screenH1: {
    fontFamily: 'sans-serif',
    fontSize: 32,
    fontWeight: '600',
    fontStyle: 'normal',
    textAlign: 'left',
    color: constants.darkBlue,
    marginBottom: 50,
  },
  paragraph: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    color: constants.darkBlue,
  },
  bleDevice: {
    backgroundColor: constants.white,
    color: constants.darkBlue,
    borderColor: constants.lightBlue,
    paddingBottom: 12,
    borderBottomWidth: 1.0,
    fontFamily: 'sans-serif',
    fontSize: 17,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 20,
    textAlign: 'left',
  },
});
