class ProjectService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'project3';
    // All fields for project3 table
    this.allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'description', 'status', 'category', 'ownerId'];
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'description', 'status', 'category', 'ownerId'];
  }

  async fetchProjects(filters = {}) {
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
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  async getProjectById(projectId) {
    try {
      const params = {
        fields: this.allFields
      };

      const response = await this.apperClient.getRecordById(this.tableName, projectId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${projectId}:`, error);
      throw error;
    }
  }

  async createProjects(projects) {
    try {
      // Filter data to only include updateable fields
      const filteredProjects = projects.map(project => {
        const filteredProject = {};
        this.updateableFields.forEach(field => {
          if (project[field] !== undefined) {
            // Handle data type formatting
            if (field === 'Tags' && Array.isArray(project[field])) {
              filteredProject[field] = project[field].join(',');
            } else {
              filteredProject[field] = project[field];
            }
          }
        });
        return filteredProject;
      });

      const params = {
        records: filteredProjects
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        console.log(`Created ${successfulRecords.length} projects successfully`);
        if (failedRecords.length > 0) {
          console.warn(`Failed to create ${failedRecords.length} projects`);
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
        console.error("Bulk project creation failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error creating projects:", error);
      throw error;
    }
  }

  async updateProjects(projects) {
    try {
      // Filter data to only include updateable fields (plus Id)
      const filteredProjects = projects.map(project => {
        const filteredProject = { Id: project.Id };
        this.updateableFields.forEach(field => {
          if (project[field] !== undefined) {
            // Handle data type formatting
            if (field === 'Tags' && Array.isArray(project[field])) {
              filteredProject[field] = project[field].join(',');
            } else {
              filteredProject[field] = project[field];
            }
          }
        });
        return filteredProject;
      });

      const params = {
        records: filteredProjects
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        console.log(`Updated ${successfulUpdates.length} projects successfully`);
        if (failedUpdates.length > 0) {
          console.warn(`Failed to update ${failedUpdates.length} projects`);
          failedUpdates.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        console.error("Bulk project update failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error updating projects:", error);
      throw error;
    }
  }

  async deleteProjects(projectIds) {
    try {
      const params = {
        RecordIds: projectIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        console.log(`Deleted ${successfulDeletions.length} projects successfully`);
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} projects`);
          failedDeletions.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return true;
      } else {
        console.error("Bulk project deletion failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Error deleting projects:", error);
      throw error;
    }
  }

  async searchProjects(query) {
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
      return await this.fetchProjects(filters);
    } catch (error) {
      console.error("Error searching projects:", error);
      throw error;
    }
  }
}

export default new ProjectService();