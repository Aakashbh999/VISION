import { ToastContainer } from "react-toastify";

const StyledToastContainer = ({ ...props }) => (
  <ToastContainer
    position="bottom-right"
    autoClose={4000}
    hideProgressBar={false}
    newestOnTop={true}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    {...props}
    style={{
      zIndex: 99999,
    }}
  />
);

export default StyledToastContainer;
