// This is the actual board card that appears when a board
// is clicked on from the dashboard.

import {styled} from "@mui/material/styles";
import {Box} from "@mui/material";



const BoardCard = styled(Box)(({theme}) => ({
    position: 'absolute',
    top: 92,
    left: 89,
    width: "fit-content",
    height: 500,
    outline: '2px solid green',
    backgroundColor: "#d2d2d2ff",

    // --- FLEXBOX CHANGES ---
    display: 'flex',
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    flexDirection: 'column', 
    padding: theme.spacing(2), 
    gap: theme.spacing(1),

}));



export default BoardCard;