class WorkspaceService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'workspace1';
    // All fields for workspace1 table
    this.allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'description', 'projectId', 'ownerId'];
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'description', 'projectId', 'ownerId'];
  }

  async fetchWorkspaces(filters = {}) {
    try {
      const params = {
        fields: this.allFields,
        orderBy: [
          {
            fieldName: "CreatedOn",
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
      console.error("Error fetching workspaces:", error);
      throw error;
    }
  }

  async getWorkspaceById(workspaceId) {
    try {
      const params = {
        fields: this.allFields
      };

      const response = await this.apperClient.getRecordById(this.tableName, workspaceId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching workspace with ID ${workspaceId}:`, error);
      throw error;
    }
  }

  async createWorkspaces(workspaces) {
    try {
      // Filter data to only include updateable fields
      const filteredWorkspaces = workspaces.map(workspace => {
        const filteredWorkspace = {};
        this.updateableFields.forEach(field => {
          if (workspace[field] !== undefined) {
            // Handle data type formatting
            if (field === 'Tags' && Array.isArray(workspace[field])) {
              filteredWorkspace[field] = workspace[field].join(',');
            } else {
              filteredWorkspace[field] = workspace[field];
            }
          }
        });
        return filteredWorkspace;
      });

      const params = {
        records: filteredWorkspaces
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        console.log(`Created ${successfulRecords.length} workspaces successfully`);
        if (failedRecords.length > 0) {
          console.warn(`Failed to create ${failedRecords.length} workspaces`);
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
        console.error("Bulk workspace creation failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error creating workspaces:", error);
      throw error;
    }
  }

  async updateWorkspaces(workspaces) {
    try {
      // Filter data to only include updateable fields (plus Id)
      const filteredWorkspaces = workspaces.map(workspace => {
        const filteredWorkspace = { Id: workspace.Id };
        this.updateableFields.forEach(field => {
          if (workspace[field] !== undefined) {
            // Handle data type formatting
            if (field === 'Tags' && Array.isArray(workspace[field])) {
              filteredWorkspace[field] = workspace[field].join(',');
            } else {
              filteredWorkspace[field] = workspace[field];
            }
          }
        });
        return filteredWorkspace;
      });

      const params = {
        records: filteredWorkspaces
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        console.log(`Updated ${successfulUpdates.length} workspaces successfully`);
        if (failedUpdates.length > 0) {
          console.warn(`Failed to update ${failedUpdates.length} workspaces`);
          failedUpdates.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        console.error("Bulk workspace update failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error updating workspaces:", error);
      throw error;
    }
  }

  async deleteWorkspaces(workspaceIds) {
    try {
      const params = {
        RecordIds: workspaceIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        console.log(`Deleted ${successfulDeletions.length} workspaces successfully`);
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} workspaces`);
          failedDeletions.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return true;
      } else {
        console.error("Bulk workspace deletion failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Error deleting workspaces:", error);
      throw error;
    }
  }

  async searchWorkspaces(query) {
    try {
      const filters = {
        where: [
          {
            fieldName: "Name",
            operator: "Contains",
            values: [query]
          }
        ]
      };
      return await this.fetchWorkspaces(filters);
    } catch (error) {
      console.error("Error searching workspaces:", error);
      throw error;
    }
  }
}

export default new WorkspaceService();