import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, ProgressBar, Card, Row, Col, Spinner } from "react-bootstrap";
import api from "../../app/api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { ICategory } from "./ProfilePage";
import { useNavigate } from "react-router-dom";
import MultiPartFormReusableDropDownSelect from "../../components/custom-input/MultiPartFormReusableDropDownSelect";
import ReusableDropDownStates from "../../components/custom-input/ReusableDropDownStates";
import { ILga, IState } from "../../interfaces/interface";
import ReusableDropDownSelect from "../../components/custom-input/ReusableDropDownSelect";
import { convertToThousand } from "../../utils/helpers";
import { userInfo } from "os";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import IconButton from "../../components/custom-button/IconButton";

// ✅ Custom file picker component
const ImageUploader = ({ images, setImages }: any) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (images.length + files.length > 5) {
            toast.error("You can only upload up to 5 images");
            return;
        }
        setImages([...images, ...files]);
    };

    const removeImage = (index: number) => {
        const updated = [...images];
        updated.splice(index, 1);
        setImages(updated);
    };



    return (
        <div>
            <label className="fw-bold mb-2">Upload Product Images (max 5)</label>
            <div
                className="p-3 border rounded text-center"
                style={{ cursor: "pointer", background: "#fafafa" }}
                onClick={() => document.getElementById("fileInput")?.click()}
            >
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    multiple
                    className="d-none"
                    onChange={handleFileChange}
                />
                <p className="mb-0">Click to choose files</p>
            </div>

            <div className="mt-3 d-flex flex-wrap gap-3">
                {images.map((file: any, i: number) => (
                    <div key={i} className="position-relative">
                        <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 8,
                                objectFit: "cover",
                            }}
                        />
                        <Button
                            size="sm"
                            variant="danger"
                            className="position-absolute top-0 end-0"
                            onClick={() => removeImage(i)}
                        >
                            ✕
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ✅ Main page component
const PostAdPage = () => {
    const [step, setStep] = useState(1);
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const navigate = useNavigate();
    const [states, setStates] = useState<IState[]>([]);
    const [lgas, setLgas] = useState<ILga[]>([]);
    const token = localStorage.getItem('userToken') || ''
    const sellerData = useSelector((state: RootState) => state.auth.userProfile)

    const getHomeData = async () => {
        setLoading(true);
        try {
            const res = await api.get('home');
            let category = res?.data?.payload?.categories.map((cat: ICategory) => ({ value: cat.id, label: cat.name }))
            setCategories(category);
            // setRecentlyPosted(res?.data?.payload?.recentlyPosted.reverse());
            // setHomeSlides8(res?.data?.payload?.categories.reverse());
            console.log({ seeRes: res });
            setLoading(false);
        } catch (error) {
            console.log({ seeErr: error })

        }

    }

    const getAllStates = async () => {
        try {
            const res = await api.get('/states/get-states');
            if (res.status == 200) {
                console.log({ dataSent: res?.data?.payload })
                let options = res?.data?.payload.map((item: any) => ({
                    value: item.state,
                    label: item.state,
                    lgas: item.localGovernmentAreas,
                }))
                setStates(options)
                const { payload } = res.data;
                console.log({ seePayloadFromOtp: payload })
                const staffProfile = payload?.staffData;
                // dispatch(setToken(payload?.token));
                // dispatch(setStaffProfile(staffProfile));
            }

        } catch (err: any) {
            // toast.error(err?.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        getAllStates()
        getHomeData()
    }, [navigate])

    const totalSteps = 5;

    const initialValues = {
        title: "",
        description: "",
        price: "",
        category: null,
        condition: null,
        state: "",
        city: "",
        location: "",
        promotionPlan: "free",

    };

    const validationSchema = Yup.object({
        title: Yup.string().required("Title is required"),
        description: Yup.string().required("Description is required"),
        price: Yup.number().required("Price is required").min(0),
        condition: Yup.object().required("Condition is required"),
        category: Yup.object().required("Category is required"),
        state: Yup.object().required("State is required"),
        city: Yup.object().required("City is required"),
        location: Yup.string().required("Location is required"),
        promotionPlan: Yup.string().required("Promotion plan is required"),
    });

    const handleSubmit = async (values: any) => {
        setLoading(true)
        try {
            const formData = new FormData();

            // ✅ Ensure we only append plain values (not objects)
            const cleanValues = {
                ...values,
                condition:
                    typeof values.condition === "object"
                        ? values.condition?.value || ""
                        : values.condition,
                state:
                    typeof values.state === "object"
                        ? values.state?.value || ""
                        : values.state,
                city:
                    typeof values.city === "object"
                        ? values.city?.value || ""
                        : values.city,
                category:
                    typeof values.category === "object"
                        ? values.category?.value || ""
                        : values.category
            };

            Object.entries(cleanValues).forEach(([key, value]) =>
                formData.append(key, value as string)
            );
            // formData.append("sellerName", sellerData?.profile?.fullName)

            // ✅ Append images properly
            images.forEach((file) => formData.append("images", file));

            // ✅ Include seller ID
            const sellerId = localStorage.getItem("userId");
            if (sellerId) formData.append("seller", sellerId);

            // ✅ Send request
            const res = await api.post("/ad", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setLoading(false)
            toast.success(res.data.message || "Ad created successfully!");
            navigate('/dashboard/ads')
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create ad");
            setLoading(false)
        }
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    return (
        <>
            <div className="bg-primary py-3 p-2 d-flex gap-2 align-items-center">
                <IconButton className="d-flex gap-2 bg-light text-dark" onClick={() => navigate(-1)} icon="bi bi-chevron-left" title="Back" />
                {/* <Button
          variant="fw-bold border bg-light"
          onClick={}
        >
          Go Back
        </Button> */}
            </div>
            <Card className="shadow-sm p-4 mx-auto mt-4" style={{ maxWidth: 700 }}>
                <h4 className="fw-bold mb-3">Create New Ad</h4>
                <div className="text-end">{step} of {5}</div>
                <ProgressBar now={(step / totalSteps) * 100} className="mb-4" />

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    validateOnBlur
                    validateOnChange
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values);
                        setSubmitting(false);
                    }}
                >
                    {({ values, validateForm, setTouched }: { values: any; validateForm: any; setTouched: any }) => (
                        <Form>
                            {/* Step 1 – Basic Details */}
                            {step === 1 && (
                                <>
                                    <Field
                                        name="title"
                                        placeholder="Ad Title"
                                        className="form-control mb-3"
                                    />
                                    <ErrorMessage
                                        name="title"
                                        component="div"
                                        className="text-danger small"
                                    />
                                    <Field
                                        name="description"
                                        as="textarea"
                                        rows={4}
                                        placeholder="Describe your product..."
                                        className="form-control mb-3"
                                    />
                                    <ErrorMessage
                                        name="description"
                                        component="div"
                                        className="text-danger small"
                                    />
                                    <MultiPartFormReusableDropDownSelect label="Select category" name="category" options={categories} />

                                    {/* <MultiPartFormReusableDropDownSelect label="Select category" name="subCategory" options={categories}/> */}
                                    <div className="mt-3"></div>
                                    <MultiPartFormReusableDropDownSelect label="Select condition" name="condition" options={[{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }]} />

                                </>
                            )}

                            {/* Step 2 – Price & Location */}
                            {step === 2 && (
                                <>
                                    <Field
                                        name="price"
                                        id='price'
                                        type="number"
                                        placeholder="Enter price"
                                        className="form-control mb-3"
                                    />
                                    <ErrorMessage
                                        name="price"
                                        component="div"
                                        className="text-danger small"
                                    />
                                    <div className='w-100'>
                                        <ReusableDropDownSelect
                                            inputType='text-i'
                                            name='state'
                                            id='state'
                                            label='State'
                                            options={states}
                                            passSelectedValue={(v) => {
                                                let lgaOptions = v.lgas.map((item: any, index: number) => ({ value: item, label: item }))
                                                setLgas(lgaOptions);
                                                // setFieldValue('lga', '');
                                            }}
                                        />
                                        <ErrorMessage name='state' component="div" className="text-danger" />
                                    </div>
                                    <div className='w-100'>
                                        <ReusableDropDownStates
                                            options={lgas}
                                            inputType="tt"
                                            placeholder="Select..."
                                            id="city"
                                            // icon='bi bi-lock-fill'
                                            // icon2='bi bi-eye'
                                            name="city"
                                            label="LGA"
                                            className="mb-3 w-100"
                                        // value={values.password}
                                        // onChange={handleChange}
                                        />
                                        <ErrorMessage name="city" component="div" className="text-danger" />
                                    </div>
                                    <p className="p-0 m-0 mt-3">Address</p>
                                    <Field
                                        name="location"
                                        placeholder="Address"
                                        className="form-control mb-3"
                                    />
                                    <ErrorMessage name="location" component="div" className="text-danger" />
                                </>
                            )}

                            {/* Step 3 – Upload Images */}
                            {step === 3 && <ImageUploader images={images} setImages={setImages} />}

                            {/* Step 4 – Promotion Plan */}
                            {step === 4 && (
                                <>
                                    <h6 className="fw-bold mb-3">Choose a promotion plan</h6>
                                    <div className="d-flex flex-column gap-2">
                                        {[{ label: "free", price: '0', duration: '7 Days' }, { label: "basic", price: '3000', duration: '14 Days' }, { label: "standard", price: '10000', duration: '31 Days' }, { label: "premium", price: '50000', duration: '60 Days' }].map((plan, index) => (
                                            <label
                                                key={index}
                                                className={`border p-3 rounded ${values.promotionPlan === plan.label ? "bg-light border-primary d-flex gap-3 justify-content-between" : "d-flex gap-2 justify-content-between"
                                                    }`}
                                            >
                                                <div className="d-flex gap-2">
                                                    <Field
                                                        type="radio"
                                                        name="promotionPlan"
                                                        value={plan.label}
                                                        className="me-2"
                                                    />
                                                    <div className="d-flex gap-3">
                                                        <p className="p-0 m-0">{plan.label.toUpperCase()}</p>
                                                        <p className="p-0 m-0 text-danger">{plan.duration.toUpperCase()}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="p-0 m-0 text-danger">{convertToThousand(plan?.price)}</p>
                                                </div>

                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Step 5 – Review & Submit */}
                            {step === 5 && (
                                <>
                                    <h6 className="fw-bold mb-3">Review Your Ad</h6>
                                    <ul className="list-unstyled">
                                        <li><b>Title:</b> {values.title}</li>
                                        <li><b>Price:</b> ₦{values.price}</li>
                                        <li><b>Condition:</b> {values?.condition?.value}</li>
                                        <li><b>Location:</b> {values.city.value}, {values.state.value}</li>
                                        <li><b>Plan:</b> {values.promotionPlan}</li>
                                    </ul>
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="d-flex justify-content-between mt-4">
                                {step > 1 && (
                                    <Button variant="secondary" onClick={prevStep}>
                                        Back
                                    </Button>
                                )}
                                {step < totalSteps && (
                                    <Button
                                        variant="primary"
                                        type="button"
                                        onClick={async () => {
                                            const errors = await validateForm();
                                            const touchedFields = Object.keys(errors);

                                            // Only go to next step if current step fields are valid
                                            if (step === 1 && (errors.title || errors.description || errors.category || errors.condition)) {
                                                toast.error("Please fill all required fields before proceeding");
                                                return;
                                            }
                                            if (step === 2 && (errors.price || errors.state || errors.city || errors.location)) {
                                                toast.error("Please complete all fields before proceeding");
                                                return;
                                            }
                                            if (step === 4 && errors.promotionPlan) {
                                                toast.error("Please choose a promotion plan");
                                                return;
                                            }

                                            nextStep();
                                        }}
                                    >
                                        Next
                                    </Button>
                                )}
                                {step === totalSteps && (
                                    <Button disabled={loading} type="submit" variant="success">
                                        {loading ? <Spinner size="sm" /> : 'Submit'}
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </>

    );
};

export default PostAdPage;
