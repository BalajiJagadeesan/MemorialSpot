/**
 * JSON objects to setup server endpoints and app color scheme
 */
const colors = {
    PRIMARY: "#607D8B",
    PRIMARY_DARK: "#455A64",
    TEXT_BLACK: "#484848",
    TEXT_WHITE: "#F6F6F6",
    SECONDARY: "#FFC107",
    BG_COLOR: "#DBDAEB"
};

const images = {
    avatar: require('../assets/icons/avatar.png'),
    tree: require('../assets/icons/tree.png'),
    bench: require('../assets/icons/bench.png'),
    garden: require('../assets/icons/garden.png'),
    other: require('../assets/icons/other.png'),
    title: require('../assets/title.png')
};

const api = {
    URL: "https://memorialparkserver.herokuapp.com/parkserver",
    // URL: "http://10.0.0.39:3000/parkserver",
    CLOUDINARY_BASE: "http://res.cloudinary.com/parkapi/image/upload/",
    IMAGE_URL: "https://memorialparkserver.herokuapp.com/upload/",
    // IMAGE_URL: "http://10.0.0.39:3000/upload/",
    VERSION: "1",
    DIRECTIONS_API: "AIzaSyASIEgswjksbjhLJjuGb6cX7GkfTyPOWOU",
};
export {colors, api, images};
