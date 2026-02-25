export const objectToQueryString = (object: any) =>
  Object.keys(object)
    .map((key) => `${key}=${object[key] === null || object[key] === undefined ? '' : object[key]}`)
    .join('&')

export const isHomePage = (pathName: string) => {
  if(pathName == '/' || pathName == '/es' || pathName == '/fr' || pathName == '/pt' || pathName == '/it' ||
    pathName == '/ja' || pathName == '/th' || pathName == '/pl' || pathName == '/ko' || pathName == '/de' ||
    pathName == '/ru' || pathName == '/da' || pathName == '/ar' || pathName == '/no' || pathName == '/nl' ||
    pathName == '/id' || pathName == '/tw' || pathName == '/zh' || pathName == '/tr' || pathName == '/zh-hans' || pathName == '/zh-hant'
  ) {
    return true
  } else {
    return false
  }
}
