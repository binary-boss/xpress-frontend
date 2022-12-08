import { Box } from "@mui/system";
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <Box className="footer">
      <Box>
        <img src="xpress_delivery.png" alt="Xpress-icon"></img>
      </Box>
      <br/>
      <p className="footer-text">
        Xpress is your one stop solution to the buy the latest trending items
        with World's Fastest Delivery to your doorstep
      </p>
      <br/>
      <p className="copyright-text">Xpress © 2022 Made with ❤️ by Aditya</p>
    </Box>
  );
};

export default Footer;
