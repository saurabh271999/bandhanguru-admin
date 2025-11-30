"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Select,
  Radio,
  DatePicker,
  Modal,
  Typography,
  Spin,
} from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useGetQuery from "../../../hooks/getQuery.hook";
import { apiUrls } from "../../../apis";
import apiClient from "../../../apis/apiClient";
import CommonButton from "../../../components/commonbtn";
import { useUIProvider } from "@/app/components/UiProvider/UiProvider";
import dayjs from "dayjs";

const { Text, Title } = Typography;

// Debounce hook
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

interface RoleOption {
  value: string;
  label: string;
}

interface FormData {
  userName: string;
  mobileNumber: string;
  emailId: string;
  password: string;
  select_agent: string;
  isActive: boolean;
  fathersName: string;
  dob: Date | null;
  gender: "male" | "female" | "other";
  alternateNumber: string;
  address: string;
  roleApplyingFor: string;
  state: string;
  district: string;
  commissioneryName: string;
}

const AddClientPage = () => {
  const { modal, messageApi } = useUIProvider();
  const router = useRouter();
  const { getQuery } = useGetQuery();

  // Form state
  const [phoneNumberValue, setPhoneNumberValue] = useState<
    string | undefined
  >();
  const [altPhoneNumberValue, setAltPhoneNumberValue] = useState<
    string | undefined
  >();
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    mobileNumber: "",
    emailId: "",
    password: "",
    select_agent: "",
    isActive: true,
    fathersName: "",
    dob: null,
    gender: "male",
    alternateNumber: "",
    address: "",
    roleApplyingFor: "",
    state: "",
    district: "",
    commissioneryName: "",
  });

  // Options and loading states
  const [roleTypes, setRoleTypes] = useState<RoleOption[]>([]);
  const [stateOptions, setStateOptions] = useState<RoleOption[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<RoleOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<RoleOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);

  // Store the location data
  const [locationData, setLocationData] = useState<any[]>([]);
  const [isStateHead, setIsStateHead] = useState(false);
  const [isCommissioneryManager, setIsCommissioneryManager] = useState(false);
  const [isDistrictCoordinator, setIsDistrictCoordinator] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Success modal state
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [createdAgentData, setCreatedAgentData] = useState<any>(null);

  const roleSuggestionsCache = useRef<Map<string, any>>(new Map());
  const stateOptionsCache = useRef<Map<string, any>>(new Map());
  const divisionOptionsCache = useRef<Map<string, any>>(new Map());
  const districtOptionsCache = useRef<Map<string, any>>(new Map());

  // Memoized location data processing to avoid expensive computations on re-renders
  const processedLocationData = useMemo(() => {
    if (!locationData.length) return { states: [], stateMap: new Map() };

    const stateMap = new Map();
    locationData.forEach((item: any) => {
      if (!stateMap.has(item.state)) {
        stateMap.set(item.state, {
          state: item.state,
          divisions: [],
        });
      }
      stateMap.get(item.state).divisions.push({
        division: item.division,
        districts: item.districts,
      });
    });

    const states = Array.from(stateMap.values());
    return { states, stateMap };
  }, [locationData]);

  // Memoized default state options
  const defaultStateOptions = useMemo(() => {
    if (!processedLocationData.states.length) return [];

    return processedLocationData.states.map((item: any) => ({
      value: item.state,
      label: item.state,
    }));
  }, [processedLocationData.states]);

  // Debounced handlers to prevent rapid API calls
  const debouncedHandleRoleChange = useDebounce((value: string) => {
    const roleLower = value?.toLowerCase() || "";
    const isStateHeadRole = roleLower.includes("state head");
    const isCommissioneryManagerRole = roleLower.includes(
      "commissionery manager"
    );
    const isDistrictCoordinatorRole = roleLower.includes(
      "district coordinator"
    );

    setIsStateHead(isStateHeadRole);
    setIsCommissioneryManager(isCommissioneryManagerRole);
    setIsDistrictCoordinator(isDistrictCoordinatorRole);

    if (isStateHeadRole) {
      loadStateHeadOptions();
    } else if (isCommissioneryManagerRole) {
      loadCommissioneryManagerOptions();
    } else if (isDistrictCoordinatorRole) {
      loadDistrictCoordinatorOptions();
    } else {
      if (locationData.length > 0 && stateOptions.length === 0) {
        const stateSet = new Set<string>();
        locationData.forEach((item: any) => {
          if (item?.state) {
            stateSet.add(item.state);
          }
        });
        const defaultStateOptions: RoleOption[] = Array.from(stateSet).map(
          (state) => ({
            value: state,
            label: state,
          })
        );
        console.log(
          "Setting default state options for regular role:",
          defaultStateOptions
        );
        setStateOptions(defaultStateOptions);
      }
    }
  }, 300);

  const debouncedHandleStateChange = useDebounce((stateName: string) => {
    console.log("State selected:", stateName);
    handleInputChange("state", stateName);

    if (isStateHead) {
      autoPopulateStateHeadData(stateName);
    } else if (isCommissioneryManager) {
      handleInputChange("commissioneryName", "");
      handleInputChange("district", "");
      setDistrictOptions([]);
      loadCommissioneryManagerDivisions(stateName);
    } else if (isDistrictCoordinator) {
      handleInputChange("commissioneryName", "");
      handleInputChange("district", "");
      setDistrictOptions([]);
      loadDistrictCoordinatorDivisions(stateName);
    } else {
      handleInputChange("commissioneryName", "");
      handleInputChange("district", "");

      const selectedStateData = locationData.find(
        (item) => item.state === stateName
      );
      console.log("Selected state data:", selectedStateData);

      if (selectedStateData && selectedStateData.divisions) {
        const divisionOptions: RoleOption[] = selectedStateData.divisions.map(
          (div: any) => ({
            value: div.division,
            label: div.division,
          })
        );
        console.log("Division options:", divisionOptions);
        setDivisionOptions(divisionOptions);

        if (!isDistrictCoordinator) {
          const allDistricts = selectedStateData.divisions.flatMap((div: any) =>
            Array.isArray(div.districts) ? div.districts : []
          );
          const districtOptions: RoleOption[] = allDistricts.map(
            (district: string) => ({
              value: district,
              label: district,
            })
          );
          console.log("All district options for state:", districtOptions);
          setDistrictOptions(districtOptions);
        } else {
          setDistrictOptions([]);
        }
      } else {
        console.warn("No divisions found for state:", stateName);
        setDivisionOptions([]);
        setDistrictOptions([]);
      }
    }
  }, 300);

  const debouncedHandleDivisionChange = useDebounce((divisionName: string) => {
    console.log("Division selected:", divisionName);
    handleInputChange("commissioneryName", divisionName);
    handleInputChange("district", "");

    if (isStateHead) {
      return;
    }

    if (isCommissioneryManager) {
      if (formData.state && divisionName) {
        autoPopulateCommissioneryManagerDistricts(formData.state, divisionName);
      }
      return;
    }

    if (isDistrictCoordinator) {
      if (formData.state && divisionName) {
        loadDistrictCoordinatorDistricts(formData.state, divisionName);
      }
      return;
    }

    const selectedStateData = locationData.find(
      (item) => item.state === formData.state
    );
    const selectedDivision = selectedStateData?.divisions.find(
      (div: any) => div.division === divisionName
    );
    console.log("Selected division data:", selectedDivision);

    if (selectedDivision && Array.isArray(selectedDivision.districts)) {
      const districtOptions: RoleOption[] = selectedDivision.districts.map(
        (district: string) => ({
          value: district,
          label: district,
        })
      );
      console.log("District options for division:", districtOptions);
      setDistrictOptions(districtOptions);
    } else {
      console.warn("No districts found for division:", divisionName);
      setDistrictOptions([]);
    }
  }, 300);

  // Fetch role types
  useEffect(() => {
    const fetchRoleTypes = async () => {
      setRoleLoading(true);
      try {
        await getQuery({
          url: apiUrls.getagentTypes,
          onSuccess: (data: any) => {
            let list: any[] = [];
            if (Array.isArray(data)) list = data;
            else if (Array.isArray(data?.data)) list = data.data;
            else if (Array.isArray(data?.types)) list = data.types;

            const toLabel = (val: string) =>
              (val || "")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (m) => m.toUpperCase());

            const options: RoleOption[] = list
              .map((item: any) => {
                if (typeof item === "string") {
                  return { value: item, label: toLabel(item) };
                }
                const value =
                  item?.value ||
                  item?.id ||
                  item?.type ||
                  item?.name ||
                  item?.roleName ||
                  "";
                const label = item?.label || toLabel(value);
                if (!value) return null;
                return { value, label } as RoleOption;
              })
              .filter(Boolean) as RoleOption[];

            setRoleTypes(options);
          },
          onFail: (error: any) => {
            console.error("Failed to fetch agent role types:", error);
            setRoleTypes([]);
          },
        });
      } catch (error) {
        console.error("Error fetching agent role types:", error);
        setRoleTypes([]);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRoleTypes();
  }, [getQuery]);

  // Fetch location data (states) - Use the full hierarchy endpoint
  useEffect(() => {
    const fetchLocationData = async () => {
      setStatesLoading(true);
      try {
        // Try to get all locations with full hierarchy
        await getQuery({
          url: apiUrls.getStates,
          onSuccess: (data: any) => {
            console.log("Raw API response:", data);

            // Handle the response - check if it's the success response format
            let locationArray: any[] = [];
            if (data?.data && Array.isArray(data.data)) {
              // If the API returns flattened data, we need to reconstruct the hierarchy
              const flatData = data.data;
              console.log("Flat data received:", flatData);

              // Group by state to reconstruct the hierarchy
              const stateMap = new Map();
              flatData.forEach((item: any) => {
                if (!stateMap.has(item.state)) {
                  stateMap.set(item.state, {
                    state: item.state,
                    divisions: [],
                  });
                }
                stateMap.get(item.state).divisions.push({
                  division: item.division,
                  districts: item.districts,
                });
              });

              locationArray = Array.from(stateMap.values());
            } else if (Array.isArray(data)) {
              locationArray = data;
            } else {
              console.warn("Unexpected API response format:", data);
              return;
            }

            console.log("Reconstructed location data:", locationArray);
            console.log("First item in location data:", locationArray[0]);

            // Store the full location data
            setLocationData(locationArray);

            // Extract unique states and set as default state options
            const stateSet = new Set<string>();
            locationArray.forEach((item: any) => {
              if (item?.state) {
                stateSet.add(item.state);
              }
            });

            const stateOptions: RoleOption[] = Array.from(stateSet).map(
              (state) => ({
                value: state,
                label: state,
              })
            );

            console.log("Initial state options set:", stateOptions);
            setStateOptions(stateOptions);
          },
          onFail: (error: any) => {
            console.error("Failed to fetch locations:", error);
            messageApi.error("Failed to load location data");
            setStateOptions([]); // Set empty array on failure
          },
        });
      } catch (error) {
        console.error("Error fetching location data:", error);
        messageApi.error("Error loading location data");
        setStateOptions([]); // Set empty array on error
      } finally {
        setStatesLoading(false);
      }
    };

    fetchLocationData();
  }, [getQuery, messageApi]);

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Use debounced handler for role changes to prevent rapid API calls
    if (field === "select_agent") {
      debouncedHandleRoleChange(value);
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneNumberValue(value);
    handleInputChange("mobileNumber", value || "");
  };

  const handleAltPhoneChange = (value: string | undefined) => {
    setAltPhoneNumberValue(value);
    handleInputChange("alternateNumber", value || "");
  };

  // Load state options for State Head role
  const loadStateHeadOptions = async () => {
    const cacheKey = "State Head";
    const cached = stateOptionsCache.current.get(cacheKey);
    if (cached) {
      console.log("Using cached State Head options");
      setStateOptions(cached);
      return;
    }

    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions("State Head"),
        onSuccess: (data: any) => {
          console.log("State Head options:", data);
          if (data?.data?.options?.states) {
            const stateOptions: RoleOption[] = data.data.options.states.map(
              (state: string) => ({
                value: state,
                label: state,
              })
            );
            console.log("Setting State Head state options:", stateOptions);
            setStateOptions(stateOptions);
            stateOptionsCache.current.set(cacheKey, stateOptions);
          } else {
            console.warn("No states found in State Head response");
          }
        },
        onFail: (error: any) => {
          console.error("Failed to load State Head options:", error);
          // Keep existing state options if API fails
        },
      });
    } catch (error) {
      console.error("Error loading State Head options:", error);
    }
  };

  // Load state options for Commissionery Manager role
  const loadCommissioneryManagerOptions = async () => {
    const cacheKey = "Commissionery Manager";
    const cached = stateOptionsCache.current.get(cacheKey);
    if (cached) {
      console.log("Using cached Commissionery Manager options");
      setStateOptions(cached);
      return;
    }

    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions("Commissionery Manager"),
        onSuccess: (data: any) => {
          console.log("Commissionery Manager options:", data);
          if (data?.data?.options?.states) {
            const stateOptions: RoleOption[] = data.data.options.states.map(
              (state: string) => ({
                value: state,
                label: state,
              })
            );
            console.log(
              "Setting Commissionery Manager state options:",
              stateOptions
            );
            setStateOptions(stateOptions);
            stateOptionsCache.current.set(cacheKey, stateOptions);
          } else {
            console.warn("No states found in Commissionery Manager response");
          }
        },
        onFail: (error: any) => {
          console.error("Failed to load Commissionery Manager options:", error);
          // Keep existing state options if API fails
        },
      });
    } catch (error) {
      console.error("Error loading Commissionery Manager options:", error);
    }
  };

  // Load state options for District Coordinator role (all fields editable)
  const loadDistrictCoordinatorOptions = async () => {
    const cacheKey = "District Coordinator";
    const cached = stateOptionsCache.current.get(cacheKey);
    if (cached) {
      console.log("Using cached District Coordinator options");
      setStateOptions(cached);
      return;
    }

    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions("District Coordinator"),
        onSuccess: (data: any) => {
          console.log("District Coordinator options:", data);
          if (data?.data?.options?.states) {
            const stateOptions: RoleOption[] = data.data.options.states.map(
              (state: string) => ({
                value: state,
                label: state,
              })
            );
            console.log(
              "Setting District Coordinator state options:",
              stateOptions
            );
            setStateOptions(stateOptions);
            stateOptionsCache.current.set(cacheKey, stateOptions);
          } else {
            // Fallback to locationData if API doesn't return states
            if (locationData.length > 0) {
              const stateSet = new Set<string>();
              locationData.forEach((item: any) => {
                if (item?.state) {
                  stateSet.add(item.state);
                }
              });
              const stateOptions: RoleOption[] = Array.from(stateSet).map(
                (state) => ({
                  value: state,
                  label: state,
                })
              );
              setStateOptions(stateOptions);
            }
          }
        },
        onFail: (error: any) => {
          console.error("Failed to load District Coordinator options:", error);
          // Fallback to locationData on failure
          if (locationData.length > 0) {
            const stateSet = new Set<string>();
            locationData.forEach((item: any) => {
              if (item?.state) {
                stateSet.add(item.state);
              }
            });
            const stateOptions: RoleOption[] = Array.from(stateSet).map(
              (state) => ({
                value: state,
                label: state,
              })
            );
            setStateOptions(stateOptions);
          }
        },
      });
    } catch (error) {
      console.error("Error loading District Coordinator options:", error);
    }
  };

  // Load divisions for District Coordinator when state is selected
  const loadDistrictCoordinatorDivisions = async (selectedState: string) => {
    const cacheKey = `District Coordinator-${selectedState}`;
    const cached = divisionOptionsCache.current.get(cacheKey);
    if (cached) {
      console.log("Using cached District Coordinator divisions for", selectedState);
      setDivisionOptions(cached);
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);
    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions("District Coordinator", selectedState),
        onSuccess: (data: any) => {
          console.log("District Coordinator divisions:", data);
          if (data?.data?.options?.divisions) {
            const divisionOptions: RoleOption[] =
              data.data.options.divisions.map((div: string) => ({
                value: div,
                label: div,
              }));
            setDivisionOptions(divisionOptions);
            divisionOptionsCache.current.set(cacheKey, divisionOptions);
          } else {
            // Fallback to locationData
            const selectedStateData = locationData.find(
              (item) => item.state === selectedState
            );
            if (selectedStateData && selectedStateData.divisions) {
              const divisionOptions: RoleOption[] =
                selectedStateData.divisions.map((div: any) => ({
                  value: div.division,
                  label: div.division,
                }));
              setDivisionOptions(divisionOptions);
            }
          }
        },
        onFail: (error: any) => {
          console.error(
            "Failed to load District Coordinator divisions:",
            error
          );
          // Fallback to locationData
          const selectedStateData = locationData.find(
            (item) => item.state === selectedState
          );
          if (selectedStateData && selectedStateData.divisions) {
            const divisionOptions: RoleOption[] =
              selectedStateData.divisions.map((div: any) => ({
                value: div.division,
                label: div.division,
              }));
            setDivisionOptions(divisionOptions);
          } else {
            setDivisionOptions([]);
          }
        },
      });
    } catch (error) {
      console.error("Error loading District Coordinator divisions:", error);
      setDivisionOptions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  // Load districts for District Coordinator when division is selected
  const loadDistrictCoordinatorDistricts = async (
    selectedState: string,
    selectedDivision: string
  ) => {
    setLocationLoading(true);
    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions(
          "District Coordinator",
          selectedState,
          selectedDivision
        ),
        onSuccess: (data: any) => {
          console.log("District Coordinator districts:", data);
          if (data?.data?.options?.districts) {
            const districtOptions: RoleOption[] =
              data.data.options.districts.map((dist: string) => ({
                value: dist,
                label: dist,
              }));
            setDistrictOptions(districtOptions);
          } else {
            // Fallback to locationData
            const selectedStateData = locationData.find(
              (item) => item.state === selectedState
            );
            const selectedDivisionData = selectedStateData?.divisions.find(
              (div: any) => div.division === selectedDivision
            );
            if (
              selectedDivisionData &&
              Array.isArray(selectedDivisionData.districts)
            ) {
              const districtOptions: RoleOption[] =
                selectedDivisionData.districts.map((district: string) => ({
                  value: district,
                  label: district,
                }));
              setDistrictOptions(districtOptions);
            }
          }
        },
        onFail: (error: any) => {
          console.error(
            "Failed to load District Coordinator districts:",
            error
          );
          // Fallback to locationData
          const selectedStateData = locationData.find(
            (item) => item.state === selectedState
          );
          const selectedDivisionData = selectedStateData?.divisions.find(
            (div: any) => div.division === selectedDivision
          );
          if (
            selectedDivisionData &&
            Array.isArray(selectedDivisionData.districts)
          ) {
            const districtOptions: RoleOption[] =
              selectedDivisionData.districts.map((district: string) => ({
                value: district,
                label: district,
              }));
            setDistrictOptions(districtOptions);
          } else {
            setDistrictOptions([]);
          }
        },
      });
    } catch (error) {
      console.error("Error loading District Coordinator districts:", error);
      setDistrictOptions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  // Load divisions for Commissionery Manager when state is selected
  const loadCommissioneryManagerDivisions = async (selectedState: string) => {
    setLocationLoading(true);
    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions("Commissionery Manager", selectedState),
        onSuccess: (data: any) => {
          console.log("Commissionery Manager divisions:", data);
          if (data?.data?.options?.divisions) {
            const divisionOptions: RoleOption[] =
              data.data.options.divisions.map((div: string) => ({
                value: div,
                label: div,
              }));
            setDivisionOptions(divisionOptions);
          }
        },
        onFail: (error: any) => {
          console.error(
            "Failed to load Commissionery Manager divisions:",
            error
          );
          setDivisionOptions([]);
        },
      });
    } catch (error) {
      console.error("Error loading Commissionery Manager divisions:", error);
      setDivisionOptions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  // Auto-populate divisions and districts for State Head
  const autoPopulateStateHeadData = async (selectedState: string) => {
    setLocationLoading(true);
    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions("State Head", selectedState),
        onSuccess: (data: any) => {
          console.log("Auto-populate data:", data);
          if (data?.data?.autoPopulate) {
            const { divisions, districts } = data.data.autoPopulate;

            // Auto-populate form fields as comma-separated read-only values
            handleInputChange("commissioneryName", divisions.join(", "));
            handleInputChange("district", districts.join(", "));

            // Set options for display
            const divisionOptions: RoleOption[] = divisions.map(
              (div: string) => ({
                value: div,
                label: div,
              })
            );
            const districtOptions: RoleOption[] = districts.map(
              (dist: string) => ({
                value: dist,
                label: dist,
              })
            );

            setDivisionOptions(divisionOptions);
            setDistrictOptions(districtOptions);
          }
        },
        onFail: (error: any) => {
          console.error("Failed to auto-populate State Head data:", error);
        },
      });
    } catch (error) {
      console.error("Error auto-populating State Head data:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Auto-populate districts for Commissionery Manager when division is selected
  const autoPopulateCommissioneryManagerDistricts = async (
    selectedState: string,
    selectedDivision: string
  ) => {
    setLocationLoading(true);
    try {
      await getQuery({
        url: apiUrls.getRoleSuggestions(
          "Commissionery Manager",
          selectedState,
          selectedDivision
        ),
        onSuccess: (data: any) => {
          console.log("Auto-populate Commissionery Manager districts:", data);
          if (data?.data?.autoPopulate?.districts) {
            const districts = data.data.autoPopulate.districts;

            // Auto-populate district field as comma-separated read-only value
            handleInputChange("district", districts.join(", "));

            // Set district options for display
            const districtOptions: RoleOption[] = districts.map(
              (dist: string) => ({
                value: dist,
                label: dist,
              })
            );
            setDistrictOptions(districtOptions);
          }
        },
        onFail: (error: any) => {
          console.error(
            "Failed to auto-populate Commissionery Manager districts:",
            error
          );
        },
      });
    } catch (error) {
      console.error(
        "Error auto-populating Commissionery Manager districts:",
        error
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.userName.trim())
      return messageApi.error("User name is required");
    if (!formData.select_agent.trim())
      return messageApi.error("Please select a role applying for");
    if (!formData.mobileNumber)
      return messageApi.error("Mobile number is required");
    if (!/^\S+@\S+\.\S+$/.test(formData.emailId))
      return messageApi.error("A valid email is required");
    if (!formData.password) return messageApi.error("Password is required");
    if (formData.password.length < 6)
      return messageApi.error("Password must be at least 6 characters long");
    if (!formData.state) return messageApi.error("State is required");
    if (!formData.commissioneryName)
      return messageApi.error("Commissionery/Division is required");

    setLoading(true);
    try {
      const { roleApplyingFor, ...payloadData } = formData;
      const payload = {
        ...payloadData,
        role: "agent",
        fathersName: formData.fathersName,
        dob: formData.dob,
        locationData: {
          state: formData.state || undefined,
          division: formData.commissioneryName || undefined,
          district: formData.district || undefined,
        },
      };

      const res = await apiClient.post(apiUrls.createUser, payload);
      console.log("Create user API response:", res);

      // Show modal immediately and fetch complete agent data
      setSuccessModalVisible(true);

      // If we have an agent ID from response, fetch complete data
      const agentId = res.data?._id || res.data?.id || res.data?.data?._id;
      console.log("Employee ID from response:", agentId);
      console.log("Employee code from response:", res.data?.agentCode);

      if (agentId) {
        await fetchCreatedAgentData(agentId);
      } else {
        // Fallback to response data if no ID available
        console.log("No agent ID found, using fallback data");
        setCreatedAgentData({
          userName: formData.userName,
          emailId: formData.emailId,
          mobileNumber: formData.mobileNumber,
          agentCode: res.data?.agentCode || "Not generated yet",
        });
      }
    } catch (error: any) {
      messageApi.error(
        error?.response?.data?.message || "Failed to create user"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/clientmanagement");
  };

  // Fetch complete agent data after creation
  const fetchCreatedAgentData = async (agentId: string) => {
    console.log("Fetching agent data for ID:", agentId);
    setModalLoading(true);
    try {
      await getQuery({
        url: `${apiUrls.getAllUsers}/${agentId}`, // Assuming this endpoint exists
        onSuccess: (data: any) => {
          console.log("Fetched agent data:", data);
          const agentData = data?.user || data?.data || data;
          console.log("Extracted agent data:", agentData);
          console.log("Employee code from fetched data:", agentData.agentCode);
          setCreatedAgentData({
            userName: agentData.userName || formData.userName,
            emailId: agentData.emailId || formData.emailId,
            mobileNumber: agentData.mobileNumber || formData.mobileNumber,
            agentCode: agentData.agentCode || "Not found in data",
          });
        },
        onFail: (error: any) => {
          console.error("Failed to fetch agent data:", error);
          // Fallback to form data if API fails
          setCreatedAgentData({
            userName: formData.userName,
            emailId: formData.emailId,
            mobileNumber: formData.mobileNumber,
            agentCode: "Failed to fetch",
          });
        },
      });
    } catch (error) {
      console.error("Error fetching agent data:", error);
      // Fallback to form data
      setCreatedAgentData({
        userName: formData.userName,
        emailId: formData.emailId,
        mobileNumber: formData.mobileNumber,
        agentCode: "Error occurred",
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="bg-white p-0 sm:p-4 md:p-6 lg:p-8 max-w-8xl mx-auto min-h-screen mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
          Add Advisor
        </h1>
        <div className="flex md:justify-end justify-center gap-2 sm:gap-3 lg:gap-5">
          <CommonButton
            label="Save"
            onClick={handleSubmit}
            loading={loading}
            type="primary"
            variant="primary"
            className="w-24 sm:w-36"
          />
          <CommonButton
            label="Back"
            onClick={() => router.push("/dashboard/clientmanagement")}
            className="w-24 sm:w-36"
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-2xl border border-[#8BBB33] p-6 md:p-8">
        <div className="grid grid-cols-1 gap-4">
          {/* Section A – Personal Information */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Section A – Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Full Name *
                </label>
                <Input
                  placeholder="Enter full name"
                  value={formData.userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                />
              </div>

              {/* Father's / Guardian's Name */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Father's / Guardian's Name
                </label>
                <Input
                  placeholder="Enter father/guardian name"
                  value={formData.fathersName}
                  onChange={(e) =>
                    handleInputChange("fathersName", e.target.value)
                  }
                />
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Date of Birth (DD/MM/YYYY)
                </label>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={formData.dob ? dayjs(formData.dob) : null}
                  onChange={(date) =>
                    handleInputChange("dob", date ? date.toDate() : null)
                  }
                  placeholder="Select date"
                  className="w-full"
                  allowClear
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Gender
                </label>
                <Radio.Group
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </Radio.Group>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Mobile Number *
                </label>
                <PhoneInput
                  country={"in"}
                  value={phoneNumberValue}
                  onChange={handlePhoneChange}
                  inputStyle={{ width: "100%", height: "40px" }}
                />
              </div>

              {/* Alternate Number */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Alternate Number
                </label>
                <PhoneInput
                  country={"in"}
                  value={altPhoneNumberValue}
                  onChange={handleAltPhoneChange}
                  inputStyle={{ width: "100%", height: "40px" }}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Email Id *
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.emailId}
                  onChange={(e) => handleInputChange("emailId", e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Password *
                </label>
                <Input.Password
                  placeholder="Enter password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>

              {/* Address */}
              <div className="flex flex-col md:col-span-2">
                <label className="block font-semibold text-sm mb-1">
                  Address
                </label>
                <Input.TextArea
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section B – Role & Work Area */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Section B – Role & Work Area
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Applying For */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Role Applying For *
                </label>
                <Select
                  size="large"
                  placeholder={roleLoading ? "Loading roles..." : "Select role"}
                  value={formData.roleApplyingFor || undefined}
                  onChange={(val) => {
                    handleInputChange("roleApplyingFor", val);
                    handleInputChange("select_agent", val);
                  }}
                  options={roleTypes}
                  loading={roleLoading}
                  showSearch
                  optionFilterProp="label"
                />
              </div>

              {/* State */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  State *
                </label>
                <Select
                  placeholder={
                    statesLoading
                      ? "Loading states..."
                      : stateOptions.length === 0
                      ? "No states available"
                      : "Select state"
                  }
                  value={formData.state || undefined}
                  options={stateOptions}
                  loading={statesLoading}
                  showSearch
                  optionFilterProp="label"
                  onChange={debouncedHandleStateChange}
                />
              </div>

              {/* Commissionery / Division */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  Commissionery / Division *
                  {isStateHead && (
                    <span className="text-blue-600 text-xs ml-2">
                      (Auto-populated for State Head)
                    </span>
                  )}
                  {isCommissioneryManager && (
                    <span className="text-green-600 text-xs ml-2">
                      (Select for Commissionery Manager)
                    </span>
                  )}
                  {isDistrictCoordinator && (
                    <span className="text-purple-600 text-xs ml-2">
                      (Select for District Coordinator)
                    </span>
                  )}
                </label>
                {isStateHead ? (
                  <Input
                    value={formData.commissioneryName}
                    readOnly
                    placeholder={
                      locationLoading
                        ? "Loading..."
                        : "Will auto-populate after selecting state"
                    }
                    style={{
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                    }}
                  />
                ) : (
                  <Select
                    placeholder={
                      locationLoading
                        ? "Loading divisions..."
                        : "Select division"
                    }
                    value={formData.commissioneryName || undefined}
                    options={divisionOptions}
                    loading={locationLoading}
                    showSearch
                    optionFilterProp="label"
                    disabled={!formData.state || divisionOptions.length === 0}
                    onChange={debouncedHandleDivisionChange}
                  />
                )}
                {isStateHead && (
                  <small className="text-gray-500 mt-1">
                    All divisions for the selected state will be assigned
                  </small>
                )}
                {isCommissioneryManager && (
                  <small className="text-gray-500 mt-1">
                    Select the division you will manage
                  </small>
                )}
                {isDistrictCoordinator && (
                  <small className="text-gray-500 mt-1">
                    Select the division for your district
                  </small>
                )}
              </div>

              {/* District */}
              <div className="flex flex-col">
                <label className="block font-semibold text-sm mb-1">
                  District
                  {isStateHead && (
                    <span className="text-blue-600 text-xs ml-2">
                      (Auto-populated for State Head)
                    </span>
                  )}
                  {isCommissioneryManager && (
                    <span className="text-green-600 text-xs ml-2">
                      (Auto-populated for Commissionery Manager)
                    </span>
                  )}
                  {isDistrictCoordinator && (
                    <span className="text-purple-600 text-xs ml-2">
                      (Select for District Coordinator)
                    </span>
                  )}
                </label>
                {isStateHead || isCommissioneryManager ? (
                  <Input.TextArea
                    value={formData.district}
                    readOnly
                    placeholder={
                      locationLoading
                        ? "Loading..."
                        : isStateHead
                        ? "Will auto-populate after selecting state"
                        : "Will auto-populate after selecting state and division"
                    }
                    style={{
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                      minHeight: "60px",
                    }}
                    rows={3}
                  />
                ) : (
                  <Select
                    placeholder="Select district"
                    value={formData.district || undefined}
                    options={districtOptions}
                    showSearch
                    optionFilterProp="label"
                    disabled={!formData.state || districtOptions.length === 0}
                    onChange={(val) => handleInputChange("district", val)}
                  />
                )}
                {isStateHead && (
                  <small className="text-gray-500 mt-1">
                    All districts for the selected state will be assigned
                  </small>
                )}
                {isCommissioneryManager && (
                  <small className="text-gray-500 mt-1">
                    All districts for the selected division will be assigned
                  </small>
                )}
                {isDistrictCoordinator && (
                  <small className="text-gray-500 mt-1">
                    Select the district you will coordinate
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex gap-2 sm:gap-3 lg:gap-5 justify-end">
          <CommonButton
            label="Save"
            onClick={handleSubmit}
            loading={loading}
            type="primary"
            variant="primary"
          />
          <CommonButton label="Back" onClick={handleCancel} />
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-2">✓</div>
            <Title level={4} className="mb-0">
              Advisor Created Successfully!
            </Title>
          </div>
        }
        open={successModalVisible}
        onCancel={() => {
          setSuccessModalVisible(false);
          router.push("/dashboard/clientmanagement");
        }}
        footer={[
          <CommonButton
            key="close"
            label="Close"
            onClick={() => {
              setSuccessModalVisible(false);
              router.push("/dashboard/clientmanagement");
            }}
            type="primary"
            variant="primary"
          />,
        ]}
        width={500}
        centered
      >
        {modalLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spin size="large" />
            <Text className="mt-4 text-gray-600">
              Loading Advisor details...
            </Text>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Name */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <Text type="secondary" className="text-xs">
                  Name
                </Text>
                <div className="font-semibold text-base">
                  {createdAgentData?.userName || "Loading..."}
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <Text type="secondary" className="text-xs">
                  Mobile Number
                </Text>
                <div className="font-semibold text-base">
                  {createdAgentData?.mobileNumber || "Loading..."}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <Text type="secondary" className="text-xs">
                  Email
                </Text>
                <div className="font-semibold text-base">
                  {createdAgentData?.emailId || "Loading..."}
                </div>
              </div>
            </div>

            {/* Employee Code */}
            {/* <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Text type="secondary" className="text-xs">
                  Advisor Code
                </Text>
                <div className="font-semibold text-base text-blue-700">
                  {createdAgentData?.agentCode || "Loading..."}
                </div>
              </div>
            </div> */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AddClientPage;
