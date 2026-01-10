import { Badge, Button, Card, Col, Image, ListGroup, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import chefAvatar from '../../assets/images/cookemoji.png'
import { useDispatch } from "react-redux"
import api from "../../app/api"
import { toast } from "react-toastify"
import CreateChefMenu from "../../components/modals/chef/CreateChefMenu"
import UpdateChefProfileModal from "../../components/modals/chef/UpdateChefProfileModal"
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik"
import * as Yup from "yup";

export interface IMenu {
    basePrice: number | null,
    chef: {
        name: string;
        email: string;
        id: string;
    };
    createdAt: string;
    id: string;
    items: any[];
    menuPic: string;
    title: string;
    updatedAt: string;
}

const AddProcurementPage = () => {
    const [refData, setRefData] = useState(false)
    const [onCreateChef, setOnCreateChef] = useState(false);
    const [onUpdateChefProfile, setOnUpdateChefProfile] = useState(false)
    const params: any = useParams();
    const id = params?.id;
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [menu, setMenu] = useState<IMenu>()
    // const [chefMenu, setChefMenu] = useState<IMenu[]>([])


    const mapMenuItemsToFormik = (menu: any, menuId: string) => ({
  menuId,
  items:
    menu?.items && menu.items.length > 0
      ? menu.items.map((item: any) => ({
          name: item.name ?? '',
          price: item.price?.toString() ?? '',
          description: item.description ?? '',
        }))
      : [
          {
            name: '',
            price: '',
            description: '',
          },
        ],
});

    const menuInitialValues = {
        menuId: id,
        items: [
            {
                name: '',
                price: '',
                description: '',
            },
        ],
    };

    const MenuValidationSchema = Yup.object().shape({

  items: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .trim()
          .required('Name is required'),

        price: Yup.number()
          .typeError('Price must be a number')
          .min(0, 'Price cannot be negative')
          .required('Price is required'),

        description: Yup.string().nullable(),
      })
    )
    .min(1, 'At least one menu item is required')
    .required(),
});
    const fetchMenu = async () => {
        setLoading(true);
        try {
            const res = await api.get(`menu/${id}`);
            setMenu(res?.data?.payload)
            // loadStates()
            // localStorage.setItem('userToken',res?.data?.token);
            // localStorage.setItem('userId',res?.data?.payload?.id);
            // dispatch(setUserData(res?.data?.payload))
            // navigate('/dashboard')
            // toast.success('Login Successful!')
            // setUserEmail(values.email);
            setLoading(false);
            // setStep(2); // proceed to OTP verification
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Failed to fetch menu')
        }
    };

    const addItemsToMenu = async (val:any) => {
        setLoading(true);
        try {
            const res = await api.post(`menu/add-items`,val);
            if(res?.data?.success){
                toast.success('Menu items added succesfully!');
                window.location.reload()
            }

            // loadStates()
            // localStorage.setItem('userToken',res?.data?.token);
            // localStorage.setItem('userId',res?.data?.payload?.id);
            // dispatch(setUserData(res?.data?.payload))
            // navigate('/dashboard')
            // toast.success('Login Successful!')
            // setUserEmail(values.email);
            setLoading(false);
            // setStep(2); // proceed to OTP verification
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Failed to fetch menu')
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [refData])
    return (
        <div>
            {/* <div className="d-flex justify-content-end">
                <CustomIconButton className="text-light" title="Create Menu" />

            </div> */}
            <h3>Add procurement to menu</h3>

            <Row className="mt-4">
                <Col sm={5}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <p className="fw-bold m-0 p-0">
                                    Menu Details
                                </p>

                                {/* <Button onClick={() => setOnUpdateChefProfile(true)} variant="outline border">Update profile</Button> */}
                            </div>
                            {
                                loading ? <Spinner size="sm" /> :
                                    <div className="d-flex gap-4 mt-4">
                                        <div className="">
                                            {
                                                menu?.menuPic ? <Image height={250} className="rounded-3" src={menu?.menuPic} /> :
                                                    <Image height={250} className="rounded-3" src={chefAvatar} />}

                                        </div>
                                        <div>
                                            <label>Ttile</label>
                                            <p>{menu?.title}</p>

                                            {/* <label>Location</label>
                                            <p>{`${chef?.location},${chef?.state}`}</p>

                                            <label>Specialties</label>
                                            <p>Continental,International</p>

                                            <label>Phone Number</label>
                                            <p>{chef?.phoneNumber}</p> */}

                                            {/* <label>Chef Type</label>
                                    <p>08166064166</p> */}
                                        </div>
                                    </div>
                            }

                        </Card.Body>
                    </Card>
                </Col>

                <Col>
                    <Card>
                        <Card.Header className="fw-bold">Procurements</Card.Header>
                        <Card.Body>
                            <div className="">

                                <div>
                                    <Formik
                                        initialValues={mapMenuItemsToFormik(menu,id)}
                                        validationSchema={MenuValidationSchema}
                                        enableReinitialize
                                        onSubmit={(values) => {
                                            const payload = {
                                                ...values,
                                                items: values.items.map((item:any)=>({
                                                    ...item,
                                                    price: Number(item.price),
                                                })),
                                            };

                                            addItemsToMenu(payload);
                                            // POST to backend
                                        }}
                                    >
                                        {() => (
                                            <Form>
                                                <FieldArray name="items">
                                                    {({ push, remove, form }) => (
                                                        <div>

                                                            {form.values.items.map((_: any, index: number) => (
                                                                <Row className="" key={index} style={{ marginBottom: 16, borderBottom: '1px solid #ddd' }}>

                                                                    <Col>
                                                                        <label>Item Name</label>
                                                                        <Field
                                                                            name={`items.${index}.name`}
                                                                            placeholder="e.g. Fried Rice"
                                                                        />
                                                                        <ErrorMessage className="text-danger" name={`items.${index}.name`} component="div" />
                                                                    </Col>

                                                                    <Col>
                                                                        <label>Price</label>
                                                                        <Field
                                                                            name={`items.${index}.price`}
                                                                            type="number"
                                                                            placeholder="e.g. 2500"
                                                                        />
                                                                        <ErrorMessage className="text-danger" name={`items.${index}.price`} component="div" />
                                                                    </Col>

                                                                    <Col>
                                                                        <label>Description</label>
                                                                        <Field
                                                                            name={`items.${index}.description`}
                                                                            placeholder="Optional"
                                                                        />
                                                                    </Col>

                                                                    <Col className="d-flex align-items-end">
                                                                        {form.values.items.length > 1 && (
                                                                            <i role="button"
                                                                                onClick={() => remove(index)}
                                                                                className="bi bi-trash text-danger"></i>
                                                                        )}
                                                                    </Col>


                                                                </Row>
                                                            ))}
                                                            <div className="w-100 text-end">
                                                                <i onClick={() =>
                                                                    push({ name: '', price: '', description: '' })
                                                                } className="bi bi-plus-square-fill text-success fs-1"></i>
                                                            </div>

                                                        </div>
                                                    )}
                                                </FieldArray>
                                                <Button type="submit" onClick={() => setOnUpdateChefProfile(true)}>Save</Button>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>

                            </div>


                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* <CreateChefMenu chefName={chef?.name || ''} chefId={chef?.id || ''} on={onCreateChef} off={() => setOnCreateChef(false)} onLogin={() => console.log('ok')} /> */}
            {/* <UpdateChefProfileModal chefName={chef?.name || ''} chefId={chef?.id || ''} on={onUpdateChefProfile} off={() => setOnUpdateChefProfile(false)} onLogin={() => console.log('ok')} /> */}
        </div>
    )
}
export default AddProcurementPage