import { CreditCard, Delete } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e)=>handleNewAddress({
          ...newAddress,
          value: e.target.value
        })}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={()=>addAddress(token,newAddress.value)}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={()=> handleNewAddress({
            ...newAddress,
            isAddingNewAddress:false
          })}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};


/**
 * set the order detail view below the cart view
 * 
 * @param {object} totalItems 
 * array of objects of total number of items in cart
 * @param {number} totalCartValue
 * total sum value of cart
 * 
 * @returns {order detail view}
 */

const OrderDetails = (
  {totalItems,
    totalCartValue
  }
) =>{
  return(
    <Box className="cart">
      <Box
          padding=".5rem"
          justifyContent="space-between"
          alignItems="center"
          fontWeight="700"
          fontSize="1.5rem"
      >
        Order Details
      </Box>
      <Box
          padding=".5rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
      >
          <Box color="#3C3C3C" alignSelf="center">
            Products
          </Box>
          <Box
            color="#3C3C3C"
            alignSelf="center"
          >
            {totalItems.length}
          </Box>
        </Box>
      <Box
          padding=".5rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
      >
          <Box color="#3C3C3C" alignSelf="center">
            SubTotal
          </Box>
          <Box
            color="#3C3C3C"
            alignSelf="center"
          >
            ${totalCartValue}
          </Box>
        </Box>
      <Box
          padding=".5rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
      >
          <Box color="#3C3C3C" alignSelf="center">
            Shipping
          </Box>
          <Box
            color="#3C3C3C"
            alignSelf="center"
          >
            $0
          </Box>
        </Box>
      <Box
          padding=".5rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
      >
          <Box color="#3C3C3C" alignSelf="center" fontWeight="700">
            Total
          </Box>
          <Box
            color="#3C3C3C"
            alignSelf="center"
            fontWeight="700"
          >
            ${totalCartValue}
          </Box>
        </Box>
    </Box>
  )
}

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  
  const totalCartValue = getTotalCartValue(items);

  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   *
   * API Endpoint - "GET /user/addresses"
   *
  **/
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      // console.log("response data", addresses.all[0].address)
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  useEffect(()=>{
    const fetchData = async ()=>{
      getAddresses(token);
    }
    fetchData();
  },[]);

  /**
   * Handler function to add a new address and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { NewAddress } newAddress
   *    Data on new address being added
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "POST /user/addresses"
   *
  **/
  const addAddress = async (token, newAddress) => {
    try {
      const response = await axios.post(`${config.endpoint}/user/addresses`,
        {
          "address":newAddress
        },
       {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-type': 'application/json'
        },
      });
     
      setAddresses({ ...addresses, all: response.data });
      setNewAddress({
        ...newAddress,
        isAddingNewAddress:false
      })

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  /**
   * Handler function to delete an address from the backend and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { String } addressId
   *    Id value of the address to be deleted
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "DELETE /user/addresses/:addressId"
   *
   */
  const deleteAddress = async (token, addressId) => {
    try {
      const response = await axios.delete(`${config.endpoint}/user/addresses/${addressId}`,
       {
        headers: {
          Accept: 'application/json, text/plain, */*',
          Authorization: `Bearer ${token}`,
        },
      });
     
      setAddresses({ ...addresses, all: response.data });

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  /**
   * Return if the request validation passed. If it fails, display appropriate warning message.
   *
   * Validation checks - show warning message with given text if any of these validation fails
   *
   * @param { Array.<CartItem> } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    Whether validation passed or not
   *
   */
  const validateRequest = (items, addresses) => {
    const balance = localStorage.getItem("balance");
    if(totalCartValue>balance){
      enqueueSnackbar("You do not have enough balance in your wallet for this purchase",
      {
        variant:"warning",
        autoHideDuration: 3000
      });
      return false;
    }else if(addresses.all===[]){
      enqueueSnackbar("Please add a new address before proceeding.",
      {
        variant:"warning",
        autoHideDuration: 3000
      });
      return false;
    }else if(addresses.selected===""){
      enqueueSnackbar("Please select one shipping address to proceed.",
      {
        variant:"warning",
        autoHideDuration: 3000
      });
      return false;
    }
    return true
  };

  /**
   * Handler function to perform checkout operation for items added to the cart for the selected address
   *
   * @param { String } token
   *    Login token
   *
   * @param { Array.<CartItem } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    If checkout operation was successful
   *
   * API endpoint - "POST /cart/checkout"
   *
   */
  const performCheckout = async (token, items, addresses, totalCartValue) => {
    if(validateRequest(items,addresses)){
      try{
        const response = await axios.post(`${config.endpoint}/cart/checkout`,
          {
            "addressId":addresses.selected
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-type': 'application/json'
            }
          }
        )
        if(response.status===200){
          enqueueSnackbar("Order placed successfully",{
            variant:"success"
          });
          localStorage.setItem("balance",`${parseInt(localStorage.getItem("balance")) - totalCartValue}`);
          history.push("/thanks", {from:"Checkout"});
        }
      }catch(e){
        if(e.response){
          enqueueSnackbar(e.response.data.message,{
            variant:"error"
          })
        }else {
          enqueueSnackbar(
            "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      }
    }
  };

  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
    };
    onLoadHandler();
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              (addresses)?
                <List>
                  {
                    addresses.all.map((addressList,index)=>{
                      return(
                        <ListItem 
                        className= {`address-item ${addresses.selected === addressList["_id"] ?"selected":"not-selected"}`} 
                        onClick = {()=>setAddresses({ ...addresses, selected : addressList["_id"] })}
                        >
                          <ListItemText primary={addressList.address} />
                          <Button variant="outlined" startIcon={<DeleteIcon />} onClick = {(e)=>{deleteAddress(token, addressList["_id"])
                          e.stopPropagation()
                          }
                          }>
                            Delete
                          </Button>
                        </ListItem>
                      )
                    })
                  }
                </List>
                
                :
                <Typography my="1rem">
                 No addresses found for this account. Please add one to proceed
               </Typography>
              }    
            </Box>
            {(newAddress.isAddingNewAddress === false) ? 
                <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
            </Button>
            :
            <AddNewAddressView
            token={token}
            newAddress={newAddress}
            handleNewAddress={setNewAddress}
            addAddress={addAddress}
            />
            }

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
              {newAddress.value}
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick = {()=>performCheckout(token,items,addresses,totalCartValue)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
          <OrderDetails totalItems = {items} totalCartValue={totalCartValue} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
