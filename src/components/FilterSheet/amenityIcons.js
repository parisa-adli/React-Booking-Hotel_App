import {
  MdAcUnit,
  MdKitchen,
  MdLaptop,
  MdLocalLaundryService,
  MdLocalParking,
  MdWifi,
} from "react-icons/md";

// Keyed by the amenity ids in services/hotels.js.
const AMENITY_ICONS = {
  wifi: MdWifi,
  kitchen: MdKitchen,
  ac: MdAcUnit,
  washer: MdLocalLaundryService,
  parking: MdLocalParking,
  workspace: MdLaptop,
};

export default AMENITY_ICONS;
