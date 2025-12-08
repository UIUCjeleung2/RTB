// This is the actual board card that appears when a board
// is clicked on from the dashboard.

import {styled} from "@mui/material/styles";
import {Box} from "@mui/material";



const BoardCard = styled(Box)(({theme}) => ({
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 25,
    width: "fit-content",
    height: 500,
    backgroundColor: "#F5F5F5",
    outline: '1px solid #D2D2D2',
    borderRadius: 20,
    boxShadow: '-1px 4px 3px 0px #00000022',

    // --- FLEXBOX CHANGES ---
    display: 'flex',
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    flexDirection: 'column', 
    padding: theme.spacing(2), 
    gap: theme.spacing(1),

}));



export default BoardCard;