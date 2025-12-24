import { Button, Card, Col, Row } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useState } from "react"

const SettingsPage= () => {
    const [onCreateChef,setOnCreateChef] = useState(false)
    const infoCardData = [
        {
            id: '1',
            label: 'Account',
            desc: 'Total revenue',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: '5',
            isMoney:true
        },
        {
            id: '2',
            label: 'User',
            desc: 'No of active customers',
            icon: 'bi bi-people-fill',
            path: '/admin',
            count: '3'
        },
        {
            id: '3',
            label: 'Notifications',
            desc: 'No of active chefs',
            icon: 'bi bi-bell-fill',
            path: '/chefs',
            count: '2'
        }

    ]
    return (
        <div>
            {/* <div className="d-flex justify-content-end">
                <CustomIconButton onClick={()=>setOnCreateChef(true)} className="text-light" title="Create New Chef"/>

            </div> */}
            <Row className="mt-4">

                {
                    infoCardData.map((card) => (<Col>
                        <Card className="rounded-3">
                            <Card.Body>
                                <p className="fw-bold m-0 p-0">
                                    {
                                        card.label
                                    }
                                </p>
                                <h3>
                                    <i className={card.icon}></i>
                                  
                                </h3>

                            </Card.Body>
                        </Card>
                    </Col>))
                }
            </Row>
<NewChefModal on={onCreateChef} off={()=>setOnCreateChef(false) } onLogin={()=>console.log('ok')}/>
        </div>
    )
}
export default SettingsPage