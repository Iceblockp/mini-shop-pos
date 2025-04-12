import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  ShoppingCart,
  Inventory,
  Category,
  Menu as MenuIcon,
  Receipt as ReceiptIcon,
  Dashboard as DashboardIcon,
  Assessment as ReportsIcon,
} from "@mui/icons-material";
import { ProductProvider } from "./contexts/ProductContext";
import ProductForm from "./components/ProductForm";
import { routes } from "./routes";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "rgba(25, 118, 210, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.12)",
            },
          },
        },
      },
    },
  },
});

function NavButtons() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Products", icon: <Inventory />, path: "/products" },
    { text: "Categories", icon: <Category />, path: "/categories" },
    { text: "Suppliers", icon: <AddIcon />, path: "/suppliers" },
    { text: "Sales", icon: <ShoppingCart />, path: "/sales" },
    { text: "Transactions", icon: <ReceiptIcon />, path: "/transactions" },
    { text: "Reports", icon: <ReportsIcon />, path: "/reports" },
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        variant={isMobile ? "temporary" : "persistent"}
        sx={{
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            top: 64,
            height: "calc(100% - 64px)",
          },
        }}
      >
        <List sx={{ width: 250 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                onClick={toggleDrawer}
                to={item.path}
                selected={
                  location.pathname === item.path ||
                  (item.path === "/products" && location.pathname === "/")
                }
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  "&.Mui-selected": {
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.12)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <IconButton
        color="inherit"
        onClick={() => setIsProductFormOpen(true)}
        sx={{ ml: "auto" }}
      >
        <AddIcon />
      </IconButton>
      <ProductForm
        open={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProductProvider>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
              <Toolbar>
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
                  sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
                >
                  Mini POS System
                </Typography>
                <NavButtons />
              </Toolbar>
            </AppBar>

            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                >
                  {route.children?.map((childRoute) => (
                    <Route
                      key={childRoute.path || "index"}
                      path={childRoute.path}
                      index={childRoute.index}
                      element={childRoute.element}
                    />
                  ))}
                </Route>
              ))}
            </Routes>
          </Box>
        </ProductProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
