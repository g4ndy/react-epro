var scheduleEventNamespace =
  'xmlns:v1="http://openclinica.org/ws/event/v1" xmlns:bean="http://openclinica.org/ws/beans"';
var listStudiesNamespace = 'xmlns:v1="http://openclinica.org/ws/study/v1"';
var importDataNamespace =
  'xmlns:v1="http://openclinica.org/ws/data/v1" xmlns:OpenClinica="http://www.openclinica.org/ns/odm_ext_v130/v3.1"';

function constructHeader(nameSpaces, lgn, sha1hashedpw) {
  return `<?xml version="1.0" encoding="utf-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ${nameSpaces}>
            <soapenv:Header>
                <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                    <wsse:UsernameToken wsu:Id="UsernameToken-27777511" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                    <wsse:Username>${lgn}</wsse:Username>
                    <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${sha1hashedpw}</wsse:Password>
                    </wsse:UsernameToken>
                </wsse:Security>
            </soapenv:Header>`;
}

export var listStudiesQuery = (lgn, sha1hashedpw) => {
  return `${constructHeader(listStudiesNamespace, lgn, sha1hashedpw)}
    <soapenv:Body>
       <v1:listAllRequest></v1:listAllRequest>
    </soapenv:Body>
 </soapenv:Envelope>`;
};

export var scheduleEventQuery = (
  lgn,
  sha1hashedpw,
  studyId,
  siteId,
  eventOid,
  subjectName,
  date
) => {
  var trimedDate = date.substr(0, 10);
  return `${constructHeader(scheduleEventNamespace, lgn, sha1hashedpw)}
           <soapenv:Body>
          <v1:scheduleRequest>
             <!--1 or more repetitions:-->
             <v1:event>
                <bean:studySubjectRef>
                   <bean:label>${subjectName}</bean:label>
                </bean:studySubjectRef>
                <bean:studyRef>
                   <bean:identifier>${studyId}</bean:identifier>
                   <!--Optional:-->
                   <bean:siteRef>
                      <bean:identifier>${siteId}</bean:identifier>
                   </bean:siteRef>
                </bean:studyRef>
                <bean:eventDefinitionOID>${eventOid}</bean:eventDefinitionOID>
                <!--Optional:-->
                <bean:startDate>${trimedDate}</bean:startDate>
             </v1:event>
          </v1:scheduleRequest>
       </soapenv:Body>
    </soapenv:Envelope>`;
};

// for importing the data into the OC scheduled event.
export var importDataQuery = (
  lgn,
  sha1hashedpw,
  siteOid,
  eventOid,
  subjectOid,
  formVersionOid,
  groupOid,
  answersObject
) => {
  // var trimedDate = date.substr(0, 10)

  // <ItemData ItemOID="I_V0DOT_D_CPSI" Value="vložená 3"/>
  // <ItemData ItemOID="I_V0DOT_D_CPSS" Value="blažená 4"/>

  var answersXmlString = "";
  for (var key in answersObject) {
    if (answersObject.hasOwnProperty(key)) {
      answersXmlString += `<ItemData ItemOID="${key}" Value="${answersObject[key]}"/>`;
    }
  }

  return `${constructHeader(importDataNamespace, lgn, sha1hashedpw)}
   <soapenv:Body>
      <v1:importRequest>
         <ODM>
         <!-- in case of site permissions only - this is the site OID -->
            <ClinicalData StudyOID="${siteOid}" MetaDataVersionOID="1">
            <!-- subject OID this time (can get it from previously conducted schedule) -->
               <SubjectData SubjectKey="${subjectOid}">
                  <!-- repeat key is important when the event is repeatable i guess -->
                  <StudyEventData StudyEventOID="${eventOid}" StudyEventRepeatKey="1">
                        <!-- form oid is crf oid of crf version! -->
                        <FormData OpenClinica:Status="" FormOID="${formVersionOid}">
                           <ItemGroupData ItemGroupOID="${groupOid}" ItemGroupRepeatKey="1" TransactionType="Insert">
                              ${answersXmlString}
                           </ItemGroupData>
                        </FormData>
                  </StudyEventData>
               </SubjectData>
            </ClinicalData>
         </ODM>
      </v1:importRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
};
