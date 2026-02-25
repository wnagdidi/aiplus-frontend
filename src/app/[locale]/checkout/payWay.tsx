import {
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import { useEffect, useState } from 'react'
import { isMobile } from '@/util/browser'
import { useTranslations } from '@/hooks/useTranslations'

interface PayWayProps {
  email?: string | null
  // firstName?: string | null
  // lastName?: string | null
  onPay: (
    cardInfo: CardInfo,
    setFormErrorMessage?: (key: string, mes: string) => void
  ) => void
}

interface Event {
  target: {
    value: string
  }
}

export interface CardInfo {
  card: string
  exexpirationDate: String
  securityCode: string
  firstName: string
  lastName: string
}

export default function PayWay({
  email,
  // firstName,
  // lastName,
  onPay,
}: PayWayProps) {
  const [payWay, setPayWay] = useState('card')
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    card: '',
    exexpirationDate: '',
    securityCode: '',
    firstName: '',
    lastName: '',
  })

  const [formError, setFormError] = useState<CardInfo>({
    card: '',
    exexpirationDate: '',
    securityCode: '',
    firstName: '',
    lastName: '',
  })

  const [errHeight, setErrHeight] = useState('0px')

  const tPayRegister = useTranslations('PayRegister')

  const handleRadioChange = (value: Event) => {
    setPayWay(value.target.value)
  }

  function isNumeric(str: string) {
    return /^\d+$/.test(str)
  }

  const isObjEmpty = (obj: Object) => {
    const values = Object.values(obj)

    let isEmpty = true

    for (const value of values) {
      if (value !== null && value !== undefined && value !== '') {
        isEmpty = false
        break
      }
    }
    return isEmpty
  }

  const isObjAllNotEmpty = (obj: Object) => {
    const values = Object.values(obj)
    let isEmpty = true
    for (const value of values) {
      if (value == null && value == undefined && value == '') {
        isEmpty = false
        break
      }
    }

    return isEmpty
  }

  function isBeforeToday(date: Date) {
    return date < getMonthLastDay()
  }

  function getMonthLastDay() {
    // 创建一个新的Date对象，默认为当前日期和时间
    var date = new Date()

    // 获取当前年份
    var year = date.getFullYear()

    // 获取当前月份（注意：月份是从0开始的，所以需要加1）
    var month = date.getMonth() + 1

    // 设置日期为下个月的第0天，即当前月的最后一天
    date.setDate(0)

    // 获取当月最后一天的日期
    var lastDay = date.getDate()

    return new Date(year + '/' + month + '/' + lastDay).toDateString() !=
      'Invalid Date'
      ? new Date(year + '/' + month + '/' + lastDay)
      : new Date(year + '-' + month + '-' + lastDay)
  }

  const getNextMonthDay = (date: Date) => {
    // 将日期设置为下个月的同一天
    date.setMonth(date.getMonth() + 1)

    // 获取新的年份、月份和日期
    var newYear = date.getFullYear()
    var newMonth = date.getMonth() + 1 // 注意：月份是从0开始的，所以需要加1
    var newDay = date.getDate()

    return new Date(newYear + '/' + newMonth + '/' + newDay).toDateString() !=
      'Invalid Date'
      ? new Date(newYear + '/' + newMonth + '/' + newDay)
      : new Date(newYear + '-' + newMonth + '-' + newDay)
  }

  const handleChange = (prop: string) => (event: Event) => {
    let value = event.target.value
    if (prop === 'card') {
      const trueCardNum = value.replace(/\s*/g, '')
      if ((value != '' && !isNumeric(trueCardNum)) || trueCardNum.length > 19)
        return
      if (trueCardNum.length < 13) {
        setFormError({ ...formError, [prop]: 'Enter the correct card number' })
        setErrHeight('30px')
        value = value
          .replace(/\s/g, '')
          .replace(/(\d{4})/g, '$1 ')
          .replace(/\s*$/, '')
        setCardInfo({ ...cardInfo, [prop]: value })
        return
      } else {
        setFormError({ ...formError, [prop]: '' })
        if (!getError({ ...formError, [prop]: '' })) {
          setErrHeight('0px')
        }
        value = value
          .replace(/\s/g, '')
          .replace(/(\d{4})/g, '$1 ')
          .replace(/\s*$/, '')
        setCardInfo({ ...cardInfo, [prop]: value })
        return
      }
    }
    if (prop === 'exexpirationDate') {
      const trueExpDate = value.replace(/\//g, '')
      if ((value != '' && !isNumeric(trueExpDate)) || trueExpDate.length > 4)
        return
      if (trueExpDate.length != 4) {
        setFormError({
          ...formError,
          [prop]: 'Enter the correct expiration time',
        })
        setErrHeight('30px')
        value = value
          .replace(/\//g, '')
          .replace(/(\d{2})/g, '$1/')
          .replace(/\/$/, '')
        setCardInfo({ ...cardInfo, [prop]: value })
        return
      } else {
        if (
          Number(value.split('/')[0]) > 12 ||
          Number(value.split('/')[0]) <= 0
        ) {
          value = value
            .replace(/\//g, '')
            .replace(/(\d{2})/g, '$1/')
            .replace(/\/$/, '')
          setCardInfo({ ...cardInfo, [prop]: value })
          setFormError({ ...formError, [prop]: 'Month input error' })
          setErrHeight('30px')
          return
        }
        if (
          isBeforeToday(
            getNextMonthDay(
              new Date(
                '20' + value.split('/')[1] + '/' + value.split('/')[0]
              ).toLocaleDateString() != 'Invalid Date'
                ? new Date(
                    '20' + value.split('/')[1] + '/' + value.split('/')[0]
                  )
                : new Date(
                    '20' + value.split('/')[1] + '-' + value.split('/')[0]
                  )
            )
          )
        ) {
          value = value
            .replace(/\//g, '')
            .replace(/(\d{2})/g, '$1/')
            .replace(/\/$/, '')
          setCardInfo({ ...cardInfo, [prop]: value })
          setFormError({ ...formError, [prop]: 'Card has expired' })
          setErrHeight('30px')
          return
        }
      }
    }
    if (prop === 'securityCode') {
      if ((value != '' && !isNumeric(value)) || value.length > 4) return
      if (value.length < 3) {
        setFormError({ ...formError, [prop]: 'Enter the correct CVC' })
        setErrHeight('30px')
        setCardInfo({ ...cardInfo, [prop]: value })
        return
      }
    }
    setFormError({ ...formError, [prop]: '' })
    if (!getError({ ...formError, [prop]: '' })) {
      setErrHeight('0px')
    }
    setCardInfo({ ...cardInfo, [prop]: value })
  }

  const setFormErrorMessage = (key: string, mes: string) => {
    setFormError({ ...formError, [key]: mes })
  }

  const getError = (formError: CardInfo) => {
    if (formError.card) return formError.card
    if (formError.exexpirationDate) return formError.exexpirationDate
    if (formError.securityCode) return formError.securityCode

    return
  }

  return (
    <Box
      sx={
        isMobile()
          ? {
              marginTop: '-40px',
            }
          : {}
      }>
      {/* <Box
        sx={{
          background: 'rgb(0,214,111)',
          height: 50,
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 'bold',
          '&:hover': {
            bgcolor: 'rgba(0,214,111,0.8)',
            transition: 'all 0.2s',
          },
        }}>
        Pay with
        <PlayCircleFilledIcon
          sx={{
            margin: '0 5px',
          }}
        />
        link
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '20px 0',
        }}>
        <Box
          sx={{
            width: '30%',
            border: '1px solid #ededed',
          }}></Box>
        <Box
          sx={
            mobile
              ? {
                  color: '#8c8c8c',
                  fontSize: 13,
                }
              : {
                  color: '#8c8c8c',
                }
          }>
          Or pay another way
        </Box>
        <Box
          sx={{
            width: '30%',
            border: '1px solid #f7f7f7',
          }}></Box>
      </Box> */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f7f7f7',
          borderRadius: 1,
          height: 50,
          padding: '0 20px',
          color: '#000',
          // border: '1px solid #e5e5e5',
          fontSize: 14,
          boxShadow:
            '0 0 0 1px #e0e0e0,0 2px 4px 0 rgba(0,0,0,0.07),0 1px 1.5px 0 rgba(0,0,0,0.05)',
        }}>
        <Box>Email</Box>
        <Box>{email}</Box>
        {/* <Box>
          <Link href="#" color="inherit">
            Continue with Link
          </Link>
        </Box> */}
      </Box>
      <Box>
        <Box
          sx={{
            margin: '25px 0 5px 0',
            fontWeight: 'bold',
          }}>
          Payment method
        </Box>
        <Box>
          <FormControl
            sx={{
              width: '100%',
            }}>
            <RadioGroup
              defaultValue="card"
              value={payWay}
              onChange={handleRadioChange}>
              <FormControlLabel
                value="card"
                control={<Radio />}
                label={
                  <Box>
                    <CreditCardIcon /> card
                  </Box>
                }
                sx={{
                  // marginTop: -1,
                }}
              />
              <Box
                sx={{
                  // margin: '0 0 0 0',
                  width: '100%',
                }}>
                <Box
                  sx={{
                    margin: '0 0 1px 0',
                  }}>
                  Card information
                </Box>
                <Box
                  // variant="outlined"
                  sx={{
                    width: '100%',
                  }}>
                  <Box
                    sx={
                      {
                        // borderBottom: '1px solid #e0e0e0',
                      }
                    }>
                    <Box
                      sx={
                        !formError.card
                          ? {
                              width: '100%',
                              height: '100%',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              borderTopLeftRadius: '10px',
                              borderTopRightRadius: '10px',
                            }
                          : {
                              width: '100%',
                              height: '100%',
                              border: '1px solid red',
                              borderTopLeftRadius: '10px',
                              borderTopRightRadius: '10px',
                            }
                      }>
                      <TextField
                        variant="standard"
                        value={cardInfo.card}
                        onChange={handleChange('card')}
                        fullWidth
                        sx={{
                          borderRadius: '6px',
                          paddingLeft: 1,
                          paddingRight: 1,
                          height: 40,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              {!formError.card ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '110px',
                                    justifyContent: 'space-between'
                                  }}>
                                  <span>
                                    {/* <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="52.499996185302734"
                                      height="60"
                                      fill="none"
                                      viewBox="49.000003814697266 6.25 52.499996185302734 17.500133514404297"
                                      className="payment-method-logo">
                                      <path
                                        fill="var(--paymentMethodLogoColor, #1434CB)"
                                        d="M74.998 6.642l-3.534 16.972h-4.29l3.533-16.972h4.29zm17.794 10.967l2.272-6.398 1.262 6.398h-3.534zm4.796 6.005h3.912L98.093 6.642h-3.66c-.758 0-1.515.522-1.767 1.305l-6.31 15.667h4.417l.883-2.48h5.427l.505 2.48zM86.482 18c0-4.439-5.931-4.7-5.931-6.658.126-.914.883-1.436 1.766-1.436 1.389-.13 2.903.13 4.165.783l.757-3.656a10.455 10.455 0 00-3.912-.783c-4.165 0-7.194 2.35-7.194 5.614 0 2.48 2.146 3.786 3.66 4.57 1.64.783 2.272 1.305 2.146 2.088 0 1.176-1.262 1.698-2.524 1.698-1.515 0-3.03-.392-4.417-1.045l-.758 3.656c1.515.653 3.155.914 4.67.914 4.67.13 7.572-2.22 7.572-5.745zM68.94 6.642l-6.815 16.972h-4.543l-3.408-13.578c0-.653-.505-1.175-1.01-1.436-1.261-.653-2.65-1.175-4.164-1.436l.126-.522h7.194c1.01 0 1.767.783 1.893 1.697l1.767 9.792 4.543-11.49h4.417z"></path>
                                      <title>Visa</title>
                                    </svg> */}
                                    <img src="/vios.svg" width='24px' height='16px' alt="" />
                                  </span>
                                  <span>
                                    {/* <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="36.20991516113281"
                                      height="50"
                                      fill="none"
                                      viewBox="11.30409049987793 3.751418113708496 36.20991516113281 22.549583435058594"
                                      className="payment-method-logo">
                                      <path
                                        fill="var(--paymentMethodLogoColor, #FF5F00)"
                                        d="M34.474 6.158H24.61v17.727h9.864V6.159z"></path>
                                      <path
                                        fill="var(--paymentMethodLogoColor, #EB001B)"
                                        d="M25.236 15.027a11.254 11.254 0 014.306-8.863 11.273 11.273 0 100 17.728 11.255 11.255 0 01-4.306-8.865z"></path>
                                      <path
                                        fill="var(--paymentMethodLogoColor, #F79E1B)"
                                        d="M47.783 15.026a11.273 11.273 0 01-18.241 8.863 11.274 11.274 0 000-17.728 11.274 11.274 0 0118.24 8.865z"></path>
                                      <title>Mastercard</title>
                                    </svg> */}
                                    <img src="/Master.svg" width='24px' height='16px' alt="" />
                                  </span>
                                  {/* <span>
                                    <img
                                      src="/payment-method/moestro.jpg"
                                      className="h-[20px]"
                                      width="90px"
                                    />
                                  </span> */}
                                  {/* <span>
                                    <img
                                      src="/payment-method/dci-dv.jpg"
                                      className="h-[15px]"
                                      height="15px"
                                      width="80px"
                                    />
                                  </span> */}
                                  <span>
                                    <img src='/Discover.svg' width='24px' height='16px' />
                                  </span>
                                  <span>
                                    {/* <img
                                      src="/payment-method/ae.jpg"
                                      className="h-[15px]"
                                      width="50px"
                                    /> */}
                                    <img src="/AmericanExpress.svg" width='24px' height='16px' alt="" />
                                  </span>
                                </Box>
                              ) : (
                                <Box>
                                  <span>
                                    <svg
                                      className="InlineSVG Icon Icon--sm Icon--red"
                                      focusable="false"
                                      fill="red"
                                      color="red"
                                      height="12"
                                      viewBox="0 0 12 12"
                                      width="12">
                                      <g
                                        fill="none"
                                        fill-rule="evenodd"
                                        transform="matrix(1 0 0 -1 0 12)">
                                        <circle
                                          cx="6"
                                          cy="3.2"
                                          fill="currentColor"
                                          r="1"></circle>
                                        <g stroke="currentColor">
                                          <circle
                                            cx="6"
                                            cy="6"
                                            r="5.5"></circle>
                                          <path
                                            d="m6 9.2v-3.2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                        </g>
                                      </g>
                                    </svg>
                                  </span>
                                </Box>
                              )}
                            </InputAdornment>
                          ),
                          style: {
                            fontSize: 14,
                          },
                        }}
                        // error={formError.card != ''}
                        placeholder="1234 1234 1234 1234"
                        // helperText={formError.card}
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                    }}>
                    <Box
                      sx={
                        !formError.exexpirationDate
                          ? {
                              width: '50%',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              borderBottomLeftRadius: '10px',
                              boxShadow: '0 1px 2px -1px #dddddd'
                            }
                          : {
                              width: '50%',
                              border: '1px solid red',
                              borderBottomLeftRadius: '10px',
                            }
                      }>
                      <TextField
                        variant="standard"
                        value={cardInfo.exexpirationDate}
                        onChange={handleChange('exexpirationDate')}
                        fullWidth
                        sx={{
                          borderRadius: '6px',
                          paddingLeft: 1,
                          height: 40,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        InputProps={{
                          disableUnderline: true,
                          style: {
                            fontSize: 14,
                          },
                        }}
                        placeholder="MM / YY"
                        error
                        // helperText={formError.exexpirationDate}
                      />
                    </Box>
                    <Box
                      sx={
                        !formError.securityCode
                          ? {
                              width: '50%',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              borderBottomRightRadius: '10px',
                              boxShadow: '0 1px 2px -1px #dddddd'
                            }
                          : {
                              width: '50%',
                              border: '1px solid red',
                              borderBottomRightRadius: '10px',
                            }
                      }>
                      <TextField
                        variant="standard"
                        value={cardInfo.securityCode}
                        onChange={handleChange('securityCode')}
                        fullWidth
                        sx={{
                          borderRadius: '6px',
                          paddingLeft: 1,
                          paddingRight: 1,
                          height: 40,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <InputAdornment position="end"></InputAdornment>
                          ),
                          style: {
                            fontSize: 14,
                          },
                        }}
                        placeholder="CVC"
                        error
                        // helperText={formError.securityCode}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    height: errHeight,
                    color: 'red',
                    transition: '0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    // border: '1px solid',
                    fontSize: 13,
                  }}>
                  {getError(formError)}
                </Box>
                <Box
                  sx={{
                    margin: '20px 0 1px 0',
                  }}>
                  Cardholder name
                </Box>
                <Card
                  variant="outlined"
                  sx={{
                    width: '100%',
                    display: 'flex',
                    boxShadow: '0 1px 2px -1px #dddddd'
                  }}>
                  <Box
                    sx={{
                      width: '50%',
                      borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    }}>
                    <TextField
                      variant="standard"
                      value={cardInfo.firstName}
                      onChange={handleChange('firstName')}
                      fullWidth
                      sx={{
                        borderRadius: '6px',
                        paddingLeft: 1,
                        height: 40,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: 14,
                        },
                      }}
                      placeholder="first name"
                    />
                  </Box>
                  <Box
                    sx={{
                      width: '50%',
                    }}>
                    <TextField
                      variant="standard"
                      value={cardInfo.lastName}
                      onChange={handleChange('lastName')}
                      fullWidth
                      sx={{
                        borderRadius: '6px',
                        paddingLeft: 1,
                        height: 40,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          fontSize: 14,
                        },
                      }}
                      placeholder="last name"
                    />
                  </Box>
                </Card>
                {/* <Box
                  sx={{
                    margin: '20px 0 5px 0',
                  }}>
                  Country or region
                </Box>
                <Card
                  variant="outlined"
                  sx={{
                    width: '100%',
                  }}>
                  <Box
                    sx={{
                      borderBottom: '1px solid #e0e0e0',
                    }}>
                    <TextField
                      variant="standard"
                      value={cardInfo.card}
                      onChange={handleChange('card')}
                      fullWidth
                      sx={{
                        borderRadius: '6px',
                        paddingLeft: 1,
                        paddingRight: 1,
                      }}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      placeholder="Country"
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                    }}>
                    <TextField
                      variant="standard"
                      value={cardInfo.card}
                      onChange={handleChange('card')}
                      fullWidth
                      sx={{
                        borderRadius: '6px',
                        paddingLeft: 1,
                      }}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      placeholder="ZIP"
                    />
                  </Box>
                </Card> */}
              </Box>
              {/* <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label="Other"
              /> */}
            </RadioGroup>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          color="primary"
          sx={
            !isObjEmpty(formError) ||
            !cardInfo.card ||
            !cardInfo.exexpirationDate ||
            !cardInfo.securityCode ||
            !cardInfo.firstName ||
            !cardInfo.lastName
              ? { width: '100%', margin: '20px 0', height: 40,color: '#c9d8fb' }
              : {
                  width: '100%',
                  margin: '20px 0',
                  height: 40,
                }
          }
          // disabled={
          //   !isObjEmpty(formError) ||
          //   !cardInfo.card ||
          //   !cardInfo.exexpirationDate ||
          //   !cardInfo.securityCode ||
          //   !cardInfo.firstName ||
          //   !cardInfo.lastName
          //   // ((!firstName || !lastName) &&
          //   //   (!cardInfo.firstName || !cardInfo.lastName))
          // }
          onClick={() => {
            if (
              !isObjEmpty(formError) ||
              !cardInfo.card ||
              !cardInfo.exexpirationDate ||
              !cardInfo.securityCode ||
              !cardInfo.firstName ||
              !cardInfo.lastName
            )
              return
            onPay(cardInfo, setFormErrorMessage)
          }}>
          {tPayRegister('subscribe_text')}
        </Button>
        <Box
          sx={{
            color: '#5e5e5e',
            textAlign: 'center',
            fontSize: 13,
          }}>
          Confirming your subscription allows AvoidAI to charge you for future
          payments according to their terms. You can always cancel your
          subscription.
        </Box>
      </Box>
    </Box>
  )
}
