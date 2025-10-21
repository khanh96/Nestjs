
import { useState } from 'react';

const PERMISSION =  [
            {
                "id": 95,
                "name": "/auth/register POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/register",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 96,
                "name": "/auth/send-otp POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/send-otp",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 97,
                "name": "/auth/login POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/login",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 98,
                "name": "/auth/logout POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/logout",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 99,
                "name": "/auth/refresh-token POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/refresh-token",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 100,
                "name": "/auth/google-link GET",
                "description": "",
                "module": "AUTH",
                "path": "/auth/google-link",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 101,
                "name": "/auth/google/callback GET",
                "description": "",
                "module": "AUTH",
                "path": "/auth/google/callback",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 102,
                "name": "/auth/forgot-password POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/forgot-password",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 103,
                "name": "/auth/2fa/setup POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/2fa/setup",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 104,
                "name": "/auth/2fa/status GET",
                "description": "",
                "module": "AUTH",
                "path": "/auth/2fa/status",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 105,
                "name": "/auth/2fa/disable POST",
                "description": "",
                "module": "AUTH",
                "path": "/auth/2fa/disable",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 106,
                "name": "/languages POST",
                "description": "",
                "module": "LANGUAGES",
                "path": "/languages",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 107,
                "name": "/languages GET",
                "description": "",
                "module": "LANGUAGES",
                "path": "/languages",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 108,
                "name": "/languages/:languageId GET",
                "description": "",
                "module": "LANGUAGES",
                "path": "/languages/:languageId",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 109,
                "name": "/languages/:languageId PATCH",
                "description": "",
                "module": "LANGUAGES",
                "path": "/languages/:languageId",
                "method": "PATCH",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 110,
                "name": "/languages/:languageId DELETE",
                "description": "",
                "module": "LANGUAGES",
                "path": "/languages/:languageId",
                "method": "DELETE",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 111,
                "name": "/profile GET",
                "description": "",
                "module": "PROFILE",
                "path": "/profile",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 112,
                "name": "/profile PUT",
                "description": "",
                "module": "PROFILE",
                "path": "/profile",
                "method": "PUT",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 113,
                "name": "/profile/change-password PUT",
                "description": "",
                "module": "PROFILE",
                "path": "/profile/change-password",
                "method": "PUT",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 114,
                "name": "/permissions GET",
                "description": "",
                "module": "PERMISSIONS",
                "path": "/permissions",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 115,
                "name": "/permissions/:permissionId GET",
                "description": "",
                "module": "PERMISSIONS",
                "path": "/permissions/:permissionId",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 116,
                "name": "/permissions POST",
                "description": "",
                "module": "PERMISSIONS",
                "path": "/permissions",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 117,
                "name": "/permissions/:permissionId PUT",
                "description": "",
                "module": "PERMISSIONS",
                "path": "/permissions/:permissionId",
                "method": "PUT",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 118,
                "name": "/permissions/:permissionId DELETE",
                "description": "",
                "module": "PERMISSIONS",
                "path": "/permissions/:permissionId",
                "method": "DELETE",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 119,
                "name": "/roles GET",
                "description": "",
                "module": "ROLES",
                "path": "/roles",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 120,
                "name": "/roles/:roleId GET",
                "description": "",
                "module": "ROLES",
                "path": "/roles/:roleId",
                "method": "GET",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 121,
                "name": "/roles POST",
                "description": "",
                "module": "ROLES",
                "path": "/roles",
                "method": "POST",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 122,
                "name": "/roles/:roleId PUT",
                "description": "",
                "module": "ROLES",
                "path": "/roles/:roleId",
                "method": "PUT",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            },
            {
                "id": 123,
                "name": "/roles/:roleId DELETE",
                "description": "",
                "module": "ROLES",
                "path": "/roles/:roleId",
                "method": "DELETE",
                "createdById": null,
                "updatedById": null,
                "deletedById": null,
                "deletedAt": null,
                "createdAt": "2025-10-21T04:22:59.141Z",
                "updatedAt": "2025-10-21T04:22:59.141Z"
            }
        ]

      
function Home() {

  const [permissions, setPermissions] = useState(PERMISSION);


  // Ground permissions by module
  function groupPermissionsByModule() {
    const newPermissions = permissions.reduce((acc, permission) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {} as Record<string, typeof PERMISSION>);
    console.log(newPermissions);

  }
   
  
  return <div>
    <button onClick={groupPermissionsByModule}>
      Group Permissions by Module
    </button>
    
    Home</div>
}

export default Home
