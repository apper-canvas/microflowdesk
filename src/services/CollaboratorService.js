class CollaboratorService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'collaborator1';
    // All fields for collaborator1 table
    this.allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'userId', 'itemId', 'itemType', 'permission', 'invitedBy', 'invitedAt'];
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'userId', 'itemId', 'itemType', 'permission', 'invitedBy', 'invitedAt'];
  }

  async fetchCollaborators(filters = {}) {
    try {
      const params = {
        fields: this.allFields,
        orderBy: [
          {
            fieldName: "invitedAt",
            SortType: "DESC"
          }
        ]
      };

      // Add filters if provided
      if (filters.where && filters.where.length > 0) {
        params.where = filters.where;
      }

      if (filters.limit) {
        params.pagingInfo = {
          limit: filters.limit,
          offset: filters.offset || 0
        };
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      throw error;
    }
  }

  async getCollaboratorById(collaboratorId) {
    try {
      const params = {
        fields: this.allFields
      };

      const response = await this.apperClient.getRecordById(this.tableName, collaboratorId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching collaborator with ID ${collaboratorId}:`, error);
      throw error;
    }
  }

  async createCollaborators(collaborators) {
    try {
      // Filter data to only include updateable fields
      const filteredCollaborators = collaborators.map(collaborator => {
        const filteredCollaborator = {};
        this.updateableFields.forEach(field => {
          if (collaborator[field] !== undefined) {
            // Handle data type formatting
            if (field === 'invitedAt' && collaborator[field]) {
              // Ensure datetime is in ISO format
              const date = new Date(collaborator[field]);
              filteredCollaborator[field] = date.toISOString();
            } else if (field === 'Tags' && Array.isArray(collaborator[field])) {
              filteredCollaborator[field] = collaborator[field].join(',');
            } else {
              filteredCollaborator[field] = collaborator[field];
            }
          }
        });
        return filteredCollaborator;
      });

      const params = {
        records: filteredCollaborators
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        console.log(`Created ${successfulRecords.length} collaborators successfully`);
        if (failedRecords.length > 0) {
          console.warn(`Failed to create ${failedRecords.length} collaborators`);
          failedRecords.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                console.error(`Field: ${error.fieldLabel}, Error: ${error.message}`);
              });
            } else if (record.message) {
              console.error(`Error: ${record.message}`);
            }
          });
        }
        
        return successfulRecords.map(result => result.data);
      } else {
        console.error("Bulk collaborator creation failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error creating collaborators:", error);
      throw error;
    }
  }

  async updateCollaborators(collaborators) {
    try {
      // Filter data to only include updateable fields (plus Id)
      const filteredCollaborators = collaborators.map(collaborator => {
        const filteredCollaborator = { Id: collaborator.Id };
        this.updateableFields.forEach(field => {
          if (collaborator[field] !== undefined) {
            // Handle data type formatting
            if (field === 'invitedAt' && collaborator[field]) {
              // Ensure datetime is in ISO format
              const date = new Date(collaborator[field]);
              filteredCollaborator[field] = date.toISOString();
            } else if (field === 'Tags' && Array.isArray(collaborator[field])) {
              filteredCollaborator[field] = collaborator[field].join(',');
            } else {
              filteredCollaborator[field] = collaborator[field];
            }
          }
        });
        return filteredCollaborator;
      });

      const params = {
        records: filteredCollaborators
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        console.log(`Updated ${successfulUpdates.length} collaborators successfully`);
        if (failedUpdates.length > 0) {
          console.warn(`Failed to update ${failedUpdates.length} collaborators`);
          failedUpdates.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        console.error("Bulk collaborator update failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error updating collaborators:", error);
      throw error;
    }
  }

  async deleteCollaborators(collaboratorIds) {
    try {
      const params = {
        RecordIds: collaboratorIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        console.log(`Deleted ${successfulDeletions.length} collaborators successfully`);
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} collaborators`);
          failedDeletions.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return true;
      } else {
        console.error("Bulk collaborator deletion failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Error deleting collaborators:", error);
      throw error;
    }
  }

  async getCollaboratorsByItem(itemId, itemType) {
    try {
      const filters = {
        where: [
          {
            fieldName: "itemId",
            operator: "ExactMatch",
            values: [itemId]
          },
          {
            fieldName: "itemType",
            operator: "ExactMatch",
            values: [itemType]
          }
        ]
      };
      return await this.fetchCollaborators(filters);
    } catch (error) {
      console.error("Error fetching collaborators by item:", error);
      throw error;
    }
  }
}

export default new CollaboratorService();