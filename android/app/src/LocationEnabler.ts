import { NativeModules } from 'react-native';

const { LocationEnabler } = NativeModules;

// This defines the functions our native module has
interface LocationEnablerInterface {
  isLocationEnabled(): Promise<boolean>;
  promptForEnableLocation(): Promise<string>;
}

export default LocationEnabler as LocationEnablerInterface;