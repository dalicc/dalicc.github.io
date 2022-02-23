# DALICC Vocabulary Documentation


## Introduction

DALICC stands for Data License Clearance Center. It is a software framework that supports application developers, legal experts and sales managers in the legally secure reutilization of third party digital sources such as data, content or software. 

As modern IT applications increasingly retrieve, store and process data from a variety of sources, questions about the compatibility of licenses and the application`s compliance with existing law may occur. Issues of rights clearance are especially relevant in the creation of derivative works compiled from multiple data sources. Clearing and negotiating rights issues is a time-consuming, complex and error-prone task. 

The DALICC framework supports the automated clearance of rights, thus helping to detect licensing conflicts and significantly reducing the costs of rights clearance in the creation of derivative works.


## DALICC Information Model

![DALICC Information Model](model.png)

The DALICC Information Model as depicted in the above figure consists of two components. 

The first component makes a reference to the [ODRL information model](https://www.w3.org/TR/odrl-model/) to express permissions, duties and prohibitions stated in a license. It uses vocabularies from ODRL, CCRel and particular extensions to describe licenses for machine processing in a legally valid manner. In this respect a license can be understood as a policy that defines specific actions as permissions, duties or prohibitions. 

The second component is the so-called Dependency Graph. This graph expresses the valid relationships between various actions defined in a license.The graph currently consists of three basic relationships: "included in", "implies" and "contradicts". The graph is used to check the consistency of the license itself and to detect potential conflicts arising from contradicting actions defined in two or more licenses.


## License Vocabulary 

In order to express a license DALICC uses terms from vocabularies provided under the following namespaces:

CCRel

@prefix cc: &lt;https://creativecommons.org/ns#> 

DALICC

@prefix dalicc: &lt;https://dalicc.net/ns#> 

@prefix lib: &lt;http://dalicc-api.net/license_library/license/> 

Dublin Core

@prefix dcmitype: &lt;http://purl.org/dc/dcmitype/> 

@prefix dct: &lt;http://purl.org/dc/terms/> 

FOAF

@prefix foaf: &lt;http://xmlns.com/foaf/0.1/> 

ODRL

@prefix odrl: &lt;http://www.w3.org/ns/odrl/2/> 

opensource.org

@prefix osl: &lt;https://opensource.org/licenses/> 

Schema.org

@prefix ns1: &lt;https://schema.org/> 

@prefix scho: &lt;http://schema.org/> 

**CCRel - Creative Commons Rights Expression Language**

@prefix cc: &lt;https://creativecommons.org/ns#> 


<table>
  <tr>
   <td>Term
   </td>
   <td>Description
   </td>
   <td>Reference
   </td>
  </tr>
  <tr>
   <td>cc:AttributionName
   </td>
   <td>the name to cite when giving attribution when the work is modified or redistributed under the terms of the associated Creative Commons license
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
  <tr>
   <td>cc:CommercialUse 
   </td>
   <td>using the Work for commercial purposes
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
  <tr>
   <td>cc:DerivativeWorks 
   </td>
   <td>preparing derivatives of the work
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
  <tr>
   <td>cc:jurisdiction
   </td>
   <td>associates the license with a particular legal jurisdiction
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
  <tr>
   <td>cc:legalcode
   </td>
   <td>references the corresponding legal text of the license
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
  <tr>
   <td>cc:Notice 
   </td>
   <td>providing an indication of the license that governs the work
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
  <tr>
   <td>cc:ShareAlike 
   </td>
   <td>when redistributing derivative works of this work, using the same license
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
  <tr>
   <td>cc:SourceCode 
   </td>
   <td>when redistributing this work (which is expected to be software when this requirement is used), source code must be provided
   </td>
   <td>https://www.w3.org/Submission/ccREL/
   </td>
  </tr>
</table>


**DALICC**

@prefix dalicc: &lt;https://dalicc.net/ns#> 

@prefix lib: &lt;http://dalicc-api.net/license_library/license/>


<table>
  <tr>
   <td>Term
   </td>
   <td>Description
   </td>
   <td>Reference
   </td>
  </tr>
  <tr>
   <td>dalicc:addStatement
   </td>
   <td>The Assignee may add his own copyright statement, notices to his modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of his modifications, or for any such Derivative Works as a whole, provided use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:attachoffer
   </td>
   <td>The Assignee may add a written offer for permissions according to the license.
   </td>
   <td>https://dalicc.net/ns#attachoffer
   </td>
  </tr>
  <tr>
   <td>dalicc:attributionNotice
   </td>
   <td>Notify the attributes of License Material.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:chargeDistributionFee
   </td>
   <td>The distribution of the Licensed Material is provided on a costly basis.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:chargeLicenseFee
   </td>
   <td>The Licensed Material is available for use at monetary cost.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:chargeOffer
   </td>
   <td>The Assignee may charge a fee for the physical act of transferring a copy, and you may at your option offer warranty protection in exchange for a fee.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:contradicts
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:CreativeWork
   </td>
   <td>This asset type comprises any type of literary work that is subject to copyright. It also includes multimedia work that combines various media types such as text, audio, images, animations, video and interactive content.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:irrevocable
   </td>
   <td>The license cannot be terminated for any reason or only that the license cannot be terminated for convenience, but still may be terminated for breach.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:modificationNotice
   </td>
   <td>A notice that indicates if the Assignee modified the Licensed Material and retains an indication of any previous modifications.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:noWarrantyNotice
   </td>
   <td>Informs that Licensed Material does not provide any warranties.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:patentFree
   </td>
   <td>The license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Licensed Material to which such Contribution(s) was submitted.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:patentNotice
   </td>
   <td>Notifies that Licensed Material is patented or includes patented parts.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:perpetual
   </td>
   <td>A perpetual license allows to use the licensed work indefinitely.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:permissionNotice
   </td>
   <td>The permission notices which are in the License shall be included.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:publish
   </td>
   <td>The Assigner permits the Assignee to prepare and issue (a book, journal) for public sale to make it generally known, to make available online.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:promote
   </td>
   <td>The Assigner permits the Assignee to use the licensed work for promotional purposes..
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:redistribute
   </td>
   <td>The Assigner permits/prohibits the Assignees to redistribute the Asset.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:royalityFree
   </td>
   <td>Refers to the right to use copyright material or intellectual property without the need to pay royalties or license fees for each use, per each copy or volume sold or some time period of use or sales.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:sellCopy
   </td>
   <td>The Assignee may sell the copies of the License Material.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:sublicense
   </td>
   <td>The license granted by a licensee to a third party, under the authority of the license originally granted by a licensor to the licensee.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:trademarkNotice
   </td>
   <td>Informs that Licensed Material is a trademark or includes trademark. The license does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the notice file.
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>dalicc:worldwide
   </td>
   <td>The license terms are valid throughout the world.
   </td>
   <td>
   </td>
  </tr>
</table>


**Dublin Core**

@prefix dct: &lt;http://purl.org/dc/terms/> .


<table>
  <tr>
   <td>Term
   </td>
   <td>Description
   </td>
   <td>Reference
   </td>
  </tr>
  <tr>
   <td>dcmitype:Dataset
   </td>
   <td>Data encoded in a defined structure.
   </td>
   <td>http://purl.org/dc/dcmitype/Dataset
   </td>
  </tr>
  <tr>
   <td>dcmitype:Software
   </td>
   <td>A computer program in source or compiled form.
   </td>
   <td>http://purl.org/dc/dcmitype/Software
   </td>
  </tr>
</table>


@prefix dct: &lt;http://purl.org/dc/terms/> .


<table>
  <tr>
   <td>Term
   </td>
   <td>Description
   </td>
   <td>Reference
   </td>
  </tr>
  <tr>
   <td>dct:alternative 
   </td>
   <td>An alternative name for the resource.
   </td>
   <td>http://purl.org/dc/terms/alternative
   </td>
  </tr>
  <tr>
   <td>dct:publisher 
   </td>
   <td>An entity responsible for making the resource available.
   </td>
   <td>http://purl.org/dc/terms/publisher
   </td>
  </tr>
  <tr>
   <td>dct:source 
   </td>
   <td>A related resource from which the described resource is derived.
   </td>
   <td>http://purl.org/dc/elements/1.1/source
   </td>
  </tr>
  <tr>
   <td>dct:title
   </td>
   <td>A name given to the resource.
   </td>
   <td>http://purl.org/dc/elements/1.1/title
   </td>
  </tr>
</table>


**ODRL - Open Digital Rights Language**

@prefix odrl: &lt;http://www.w3.org/ns/odrl/2/> 


<table>
  <tr>
   <td>Term
   </td>
   <td>Description
   </td>
   <td>Reference
   </td>
  </tr>
  <tr>
   <td>odrl:assigner 
   </td>
   <td>The Party is the issuer of the Rule.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/assigner">http://www.w3.org/ns/odrl/2/assigner</a>
   </td>
  </tr>
  <tr>
   <td>odrl:AssetCollection 
   </td>
   <td>An Asset that is collection of individual resources
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/AssetCollection">http://www.w3.org/ns/odrl/2/AssetCollection</a>
   </td>
  </tr>
  <tr>
   <td>odrl:derive 
   </td>
   <td>To create a new derivative Asset from this Asset and to edit or modify the derivative.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/derive">http://www.w3.org/ns/odrl/2/derive</a>
   </td>
  </tr>
  <tr>
   <td>odrl:display
   </td>
   <td>To create a static and transient rendition of an Asset.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/display">http://www.w3.org/ns/odrl/2/display</a>
   </td>
  </tr>
  <tr>
   <td>odrl:distribute
   </td>
   <td>To supply the Asset to third-parties.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/distribute">http://www.w3.org/ns/odrl/2/distribute</a>
   </td>
  </tr>
  <tr>
   <td>odrl:grantUse
   </td>
   <td>To grant the use of the Asset to third parties.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/grantUse">http://www.w3.org/ns/odrl/2/grantUse</a>
   </td>
  </tr>
  <tr>
   <td>odrl:implies
   </td>
   <td>An Action asserts that another Action is not prohibited to enable its operational semantics.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/implies">http://www.w3.org/ns/odrl/2/implies</a>
   </td>
  </tr>
  <tr>
   <td>odrl:inludedin
   </td>
   <td>An Action transitively asserts that another Action that encompasses its operational semantics.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/includedIn">http://www.w3.org/ns/odrl/2/includedIn</a>
   </td>
  </tr>
  <tr>
   <td>odrl:modify
   </td>
   <td>To change existing content of the Asset. A new asset is not created by this action.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/modify">http://www.w3.org/ns/odrl/2/modify</a>
   </td>
  </tr>
  <tr>
   <td>odrl:present 
   </td>
   <td>To publicly perform the Asset.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/present">http://www.w3.org/ns/odrl/2/present</a>
   </td>
  </tr>
  <tr>
   <td>odrl:reproduce 
   </td>
   <td>To make duplicate copies of the Asset in any material form.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/reproduce">http://www.w3.org/ns/odrl/2/reproduce</a>
   </td>
  </tr>
  <tr>
   <td>odrl:Set
   </td>
   <td>A Policy that expresses a Rule over an Asset.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/Set">http://www.w3.org/ns/odrl/2/Set</a>
   </td>
  </tr>
  <tr>
   <td>odrl:target 
   </td>
   <td>The target property indicates the Asset that is the primary subject to which the Rule action directly applies.
   </td>
   <td><a href="http://www.w3.org/ns/odrl/2/target">http://www.w3.org/ns/odrl/2/target</a>
   </td>
  </tr>
</table>

