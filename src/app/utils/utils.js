import { Client as TwilioClient } from "@twilio/conversations";
import apiClient from "../apis/apiClient";
import { apiUrls } from "../apis";
import {
  FaListAlt,
  FaRegBuilding,
  FaUserFriends,
  FaUserCog,
  FaHandshake,
  FaUserCheck,
  FaIdBadge,
  FaBoxOpen,
  FaClipboardCheck,
  FaClipboard,
  FaTasks,
  FaBookOpen,
  FaLayerGroup,
  FaWarehouse,
  FaMoneyBill,
  FaMoneyCheck,
  FaMoneyBillWave,
} from "react-icons/fa";

export const setLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const removeFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const getLocalStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    if (data === null) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing localStorage data for key "${key}":`, error);
    localStorage.removeItem(key); // Remove corrupted data
    return null;
  }
};

export const getUserDetails = () => {
  let userDetails = {};
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("userDetails");
      if (data && data !== "undefined" && data !== "null") {
        userDetails = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error parsing userDetails from localStorage:", error);
      localStorage.removeItem("userDetails"); // Remove corrupted data
      userDetails = {};
    }
  }
  return userDetails;
};

export const initializeTwilioClient = async (identity) => {
  const response = await apiClient(
    `${apiUrls.generateAccessToken}?identity=${identity}`
  );
  console.log(response?.data, "responseresponse");

  const token = response?.data?.token;
  const client = new TwilioClient(token);

  client.on("tokenAboutToExpire", async () => {
    const newResponse = await apiClient(
      `${apiUrls.generateAccessToken}?identity=${identity}`
    );
    console.log(newResponse?.data, "newResponseresponseresponse");
    const newToken = newResponse?.data?.token;
    client.updateToken(newToken);
  });

  return client;
};

export const buildHierarchy = (users, rootId = null) => {
  const userMap = new Map();

  users.forEach((user) => {
    userMap.set(user._id, { ...user, children: [] });
  });

  const hierarchy = [];

  users.forEach((user) => {
    // Agar rootId diya gaya hai to wahi root hoga
    if (rootId && user._id === rootId) {
      hierarchy.push(userMap.get(user._id));
    } else if (!rootId && !user?.reporting_to) {
      hierarchy.push(userMap.get(user._id));
    } else {
      const manager = userMap.get(user?.reporting_to);
      if (manager) {
        manager.children.push(userMap.get(user._id));
      }
    }
  });

  return hierarchy;
};

export const hasPermissions = (perms, userData, notAll) => {
  let userDetails = userData;
  if (!userDetails?._id) {
    userDetails = getUserDetails();
  }
  const permissions = userDetails?.user?.role?.permissions;
  return notAll
    ? perms?.some((perm) => permissions?.includes(perm))
    : perms?.every((perm) => permissions?.includes(perm));
};

export const getSidebarOptions = (userData) => {
  return [
    {
      title: "List Services",
      link: "/dashboard/service-request-list",
      show:
        userData?.user?.clientId?._id &&
        userData?.user?.user_type === "clientUser",
      active_icon: () => <FaListAlt />,
      inactive_icon: () => <FaListAlt />,
    },
    {
      title: userData?.user?.clientId?.client_name,
      link: "/dashboard/client-chart",
      show:
        userData?.user?.clientId?._id &&
        userData?.user?.user_type === "clientUser",
      is_client_user: true,
      active_icon: () => <FaRegBuilding />,
      inactive_icon: () => <FaRegBuilding />,
    },
    {
      title: "Admin Management",
      link: "/dashboard/user-list",
      show:
        userData?.user?.servicePartnerId &&
        userData?.user?.userType === "admin",
      active_icon: () => <FaUserFriends />,
      inactive_icon: () => <FaUserFriends />,
    },
    {
      title: "Agent Management",
      link: "/dashboard/client-list",
      show:
        !userData?.user?.servicePartnerId &&
        !userData?.user?.clientId &&
        userData?.user?.userType === "admin",
      active_icon: () => <FaHandshake />,
      inactive_icon: () => <FaHandshake />,
    },
    {
      title: "Client User Management",
      link: "/dashboard/client-user-list",
      show:
        (userData?.user?.clientId?._id &&
          userData?.user?.user_type === "admin") ||
        hasPermissions(["client_user.view"], userData),
      active_icon: () => <FaUserCog />,
      inactive_icon: () => <FaUserCog />,
    },
    {
      title: "Service Partners Management",
      link: "/dashboard/service-partners-list",
      show:
        !userData?.user?.servicePartnerId &&
        !userData?.user?.clientId &&
        userData?.user?.userType === "admin",
      active_icon: () => <FaUserCheck />,
      inactive_icon: () => <FaUserCheck />,
    },
    {
      title: "Assigned Service Partners",
      link: "/dashboard/assigned-service-partners",
      show:
        !userData?.user?.servicePartnerId &&
        !userData?.user?.clientId &&
        userData?.user?.userType === "admin",
      active_icon: () => <FaIdBadge />,
      inactive_icon: () => <FaIdBadge />,
    },
    {
      title: "Role Management",
      link: "/dashboard/role-list",
      show:
        userData?.user?.servicePartnerId &&
        userData?.user?.userType === "admin",
      active_icon: () => <FaClipboardCheck />,
      inactive_icon: () => <FaClipboardCheck />,
    },
    {
      title: "Inventory Management",
      link: null,
      show: hasPermissions(["inventory.view"], userData),
      active_icon: () => <FaBoxOpen />,
      inactive_icon: () => <FaBoxOpen />,
      isDropdown: true,
      subOptions: [
        {
          title: "Manage Items",
          link: "/dashboard/inventory",
          show: hasPermissions(["inventory.manage_items"], userData),
        },
        {
          title: "Inventory In",
          link: "/dashboard/inventory/in",
          show: hasPermissions(["inventory.view_inventory_in"], userData),
        },
        {
          title: "Inventory Out",
          link: "/dashboard/inventory/out",
          show: hasPermissions(["inventory.view_inventory_out"], userData),
        },
        {
          title: "View Requests",
          link: "/dashboard/inventory/requests-list",
          show: hasPermissions(["inventory.view_requests"], userData),
        },
      ],
    },
    {
      title: "Purchase Order Management",
      link: null,
      show: hasPermissions(["purchase_order.view"], userData),
      active_icon: () => <FaBoxOpen />,
      inactive_icon: () => <FaBoxOpen />,
      isDropdown: true,
      subOptions: [
        {
          title: "Create Purchase Order",
          link: "/dashboard/purchase-order/add",
          show: hasPermissions(["purchase_order.add"], userData),
        },
        {
          title: "Purchase Orders List",
          link: "/dashboard/purchase-order",
          show: hasPermissions(["purchase_order.view"], userData),
        },
      ],
    },
    {
      title: "RC Management",
      link: "/dashboard/rc-list",
      show: hasPermissions(["rc.view"], userData),
      active_icon: () => <FaClipboard />,
      inactive_icon: () => <FaClipboard />,
    },
    {
      title: "Category Management",
      link: "/dashboard/category-list",
      show: hasPermissions(["category.view"], userData),
      active_icon: () => <FaLayerGroup />,
      inactive_icon: () => <FaLayerGroup />,
    },
    {
      title: "Supplier Management",
      link: "/dashboard/supplier-list",
      show: hasPermissions(["supplier.view"], userData),
      active_icon: () => <FaWarehouse />,
      inactive_icon: () => <FaWarehouse />,
    },
    {
      title: "Service Requests",
      link: "/dashboard/service-requests",
      show: hasPermissions(["service_request.view_all"], userData),
      active_icon: () => <FaTasks />,
      inactive_icon: () => <FaTasks />,
    },
    {
      title: "Tasks",
      link: "/dashboard/tasks",
      show: hasPermissions(["task.view"], userData),
      active_icon: () => <FaClipboardCheck />,
      inactive_icon: () => <FaClipboardCheck />,
    },
    {
      title: "Ledger",
      link: "/dashboard/ledger",
      show: hasPermissions(
        ["ledger.view_all", "ledger.view_self"],
        userData,
        true
      ),
      active_icon: () => <FaBookOpen />,
      inactive_icon: () => <FaBookOpen />,
    },
    {
      title: "Quotations",
      link: "/dashboard/quotations-list",
      show: hasPermissions(["quotation.view"], userData),
      active_icon: () => <FaMoneyBill />,
      inactive_icon: () => <FaMoneyBill />,
    },
    {
      title: "Payments",
      link: "/dashboard/payments",
      show: hasPermissions(
        ["payment.view_all", "payment.view_self"],
        userData,
        true
      ),
      active_icon: () => <FaMoneyCheck />,
      inactive_icon: () => <FaMoneyCheck />,
    },
    {
      title: "Expenses",
      link: "/dashboard/expenses",
      show: hasPermissions(
        ["expense.view_all", "expense.view_self"],
        userData,
        true
      ),
      active_icon: () => <FaMoneyBillWave />,
      inactive_icon: () => <FaMoneyBillWave />,
    },
  ];
};

// export const getSidebarOptions = (userData) => {
//   return [
//     {
//       title: "List Services",
//       link: "/dashboard/service-request-list",
//       show:
//         userData?.user?.clientId?._id &&
//         userData?.user?.user_type === "clientUser",
//       active_icon: "/images/list-white.png",
//       inactive_icon: "/images/list.png",
//     },
//     {
//       title: userData?.user?.clientId?.client_name,
//       link: "/dashboard/client-chart",
//       show:
//         userData?.user?.clientId?._id &&
//         userData?.user?.user_type === "clientUser",
//       is_client_user: true,
//       active_icon: "/images/bank-white.png",
//       inactive_icon: "/images/bank.png",
//     },
//     {
//       title: "User Management",
//       link: "/dashboard/user-list",
//       show:
//         userData?.user?.servicePartnerId &&
//         userData?.user?.userType === "admin",
//       active_icon: "/images/user-white.png",
//       inactive_icon: "/images/user.png",
//     },
//     {
//       title: "Agent Management",
//       link: "/dashboard/client-list",
//       show:
//         !userData?.user?.servicePartnerId &&
//         !userData?.user?.clientId &&
//         userData?.user?.userType === "admin",
//       active_icon: "/images/bank-white.png",
//       inactive_icon: "/images/bank.png",
//     },

//     {
//       title: "Client User Management",
//       link: `/dashboard/client-user-list`,
//       show:
//         (userData?.user?.clientId?._id &&
//           userData?.user?.user_type === "admin") ||
//         hasPermissions(["client_user.view"], userData),
//       active_icon: "/images/user-white.png",
//       inactive_icon: "/images/user.png",
//     },
//     {
//       title: "Service Partners Management",
//       link: "/dashboard/service-partners-list",
//       show:
//         !userData?.user?.servicePartnerId &&
//         !userData?.user?.clientId &&
//         userData?.user?.userType === "admin",
//       active_icon: "/images/bank-white.png",
//       inactive_icon: "/images/bank.png",
//     },
//     {
//       title: "Assigned Service Partners",
//       link: `/dashboard/assigned-service-partners`,
//       show:
//         !userData?.user?.servicePartnerId &&
//         !userData?.user?.clientId &&
//         userData?.user?.userType === "admin",
//       active_icon: "/images/bank-white.png",
//       inactive_icon: "/images/bank.png",
//     },
//     // {
//     //   title: "RC Management",
//     //   link: "/dashboard/rc-list",
//     //   show:
//     //     userData?.user?.clientId?._id && userData?.user?.user_type === "admin",
//     //   active_icon: "/images/client-white.png",
//     //   inactive_icon: "/images/client.png",
//     // },
//     {
//       title: "Role Management",
//       link: "/dashboard/role-list",
//       show:
//         userData?.user?.servicePartnerId &&
//         userData?.user?.userType === "admin",
//       active_icon: "/images/list-white.png",
//       inactive_icon: "/images/list.png",
//     },
//     {
//       title: "Inventory Management",
//       link: null,
//       show: hasPermissions(["inventory.view"], userData),
//       active_icon: "/images/list-white.png",
//       inactive_icon: "/images/list.png",
//       isDropdown: true,
//       subOptions: [
//         {
//           title: "Manage Items",
//           link: "/dashboard/inventory",
//           show: hasPermissions(["inventory.manage_items"], userData),
//         },
//         {
//           title: "Inventory In",
//           link: "/dashboard/inventory/in",
//           show: hasPermissions(["inventory.view_inventory_in"], userData),
//         },
//         {
//           title: "Inventory Out",
//           link: "/dashboard/inventory/out",
//           show: hasPermissions(["inventory.view_inventory_out"], userData),
//         },
//       ],
//     },
//     {
//       title: "RC Management",
//       link: "/dashboard/rc-list",
//       show: hasPermissions(["rc.view"], userData),
//       active_icon: "/images/list-white.png",
//       inactive_icon: "/images/list.png",
//     },
//     {
//       title: "Category Management",
//       link: "/dashboard/category-list",
//       show: hasPermissions(["category.view"], userData),
//       active_icon: "/images/list-white.png",
//       inactive_icon: "/images/list.png",
//     },
//     {
//       title: "Supplier Management",
//       link: "/dashboard/supplier-list",
//       show: hasPermissions(["supplier.view"], userData),
//       active_icon: "/images/list-white.png",
//       inactive_icon: "/images/list.png",
//     },
//     {
//       title: "Service Requests",
//       link: "/dashboard/service-requests",
//       show: hasPermissions(["service_request.view_all"], userData),
//       active_icon: "/images/assign-white.png",
//       inactive_icon: "/images/assign.png",
//     },
//     {
//       title: "Tasks",
//       link: "/dashboard/tasks",
//       show: hasPermissions(["task.view"], userData),
//       active_icon: "/images/assign-white.png",
//       inactive_icon: "/images/assign.png",
//     },
//     {
//       title: "Ledger",
//       link: "/dashboard/ledger/",
//       show: hasPermissions(["ledger.view"], userData),
//       active_icon: "/images/assign-white.png",
//       inactive_icon: "/images/assign.png",
//     },
//   ];
// };

export const indianTimeFormatter = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const indianDateFormatter = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function numberToWordsIndian(num) {
  if (num === 0) return "zero";

  const belowTwenty = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const places = ["", "thousand", "lakh", "crore"];

  function helper(n) {
    if (!n) return "";
    if (n === 0) return "";
    else if (n < 20) return belowTwenty[n] + " ";
    else if (n < 100)
      return tens[Math.floor(n / 10)] + " " + belowTwenty[n % 10] + " ";
    else
      return (
        belowTwenty[Math.floor(n / 100)] +
        " hundred " +
        (n % 100 !== 0 ? "and " + helper(n % 100) : "")
      );
  }

  let result = "";
  let parts = [];

  // Split number into Indian numbering format (crore, lakh, thousand, hundred)
  parts.push(num % 1000); // Hundreds
  num = Math.floor(num / 1000);
  parts.push(num % 100); // Thousands
  num = Math.floor(num / 100);
  parts.push(num % 100); // Lakhs
  num = Math.floor(num / 100);
  parts.push(num); // Crores

  let i = parts.length - 1;

  while (i >= 0) {
    if (parts[i] !== 0) {
      result += helper(parts[i]) + (i > 0 ? places[i] + " " : "");
    }
    i--;
  }

  return result.trim();
}

export function capitalizeWords(sentence) {
  if (!sentence) return "";
  return sentence
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function normalizeText(str) {
  return str.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}
