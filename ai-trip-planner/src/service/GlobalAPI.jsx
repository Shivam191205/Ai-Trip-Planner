import axios from "axios";
const BASE_URL= "https://places.googleapis.com/v1/places:searchText"

const config={
    headers:{
        "Content-Type":"application/json",
        'X-Goog-Api-Key': import.meta.env.VITE_GEOAPIFY_API_KEY,
        'X-Goog-FieldMask':[
            'places.photos',
            'places.id',
            'places.displayName',
        ]
    }
}


export const GetPlaceDetails = (data) => axios.post(BASE_URL, data, config)