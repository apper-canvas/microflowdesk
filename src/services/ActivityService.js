class ActivityService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'Activity3';
    // All fields for Activity3 table
    this.allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'userId', 'action', 'itemName', 'itemType', 'timestamp'];
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'userId', 'action', 'itemName', 'itemType', 'timestamp'];
  }

  async fetchActivities(filters = {}) {
    try {
      const params = {
        fields: this.allFields,
        orderBy: [
          {
            fieldName: "timestamp",
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
      console.error("Error fetching activities:", error);
      throw error;
    }
  }

  async getActivityById(activityId) {
    try {
      const params = {
        fields: this.allFields
      };

      const response = await this.apperClient.getRecordById(this.tableName, activityId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity with ID ${activityId}:`, error);
      throw error;
    }
  }

  async createActivities(activities) {
    try {
      // Filter data to only include updateable fields
      const filteredActivities = activities.map(activity => {
        const filteredActivity = {};
        this.updateableFields.forEach(field => {
          if (activity[field] !== undefined) {
            // Handle data type formatting
            if (field === 'timestamp' && activity[field]) {
              // Ensure datetime is in ISO format
              const date = new Date(activity[field]);
              filteredActivity[field] = date.toISOString();
            } else if (field === 'Tags' && Array.isArray(activity[field])) {
              filteredActivity[field] = activity[field].join(',');
            } else {
              filteredActivity[field] = activity[field];
            }
          }
        });
        return filteredActivity;
      });

      const params = {
        records: filteredActivities
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        console.log(`Created ${successfulRecords.length} activities successfully`);
        if (failedRecords.length > 0) {
          console.warn(`Failed to create ${failedRecords.length} activities`);
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
        console.error("Bulk activity creation failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error creating activities:", error);
      throw error;
    }
  }

  async updateActivities(activities) {
    try {
      // Filter data to only include updateable fields (plus Id)
      const filteredActivities = activities.map(activity => {
        const filteredActivity = { Id: activity.Id };
        this.updateableFields.forEach(field => {
          if (activity[field] !== undefined) {
            // Handle data type formatting
            if (field === 'timestamp' && activity[field]) {
              // Ensure datetime is in ISO format
              const date = new Date(activity[field]);
              filteredActivity[field] = date.toISOString();
            } else if (field === 'Tags' && Array.isArray(activity[field])) {
              filteredActivity[field] = activity[field].join(',');
            } else {
              filteredActivity[field] = activity[field];
            }
          }
        });
        return filteredActivity;
      });

      const params = {
        records: filteredActivities
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        console.log(`Updated ${successfulUpdates.length} activities successfully`);
        if (failedUpdates.length > 0) {
          console.warn(`Failed to update ${failedUpdates.length} activities`);
          failedUpdates.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        console.error("Bulk activity update failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error updating activities:", error);
      throw error;
    }
  }

  async deleteActivities(activityIds) {
    try {
      const params = {
        RecordIds: activityIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        console.log(`Deleted ${successfulDeletions.length} activities successfully`);
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} activities`);
          failedDeletions.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return true;
      } else {
        console.error("Bulk activity deletion failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Error deleting activities:", error);
      throw error;
    }
  }

  async logActivity(userId, action, itemName, itemType) {
    try {
      const activity = {
        userId,
        action,
        itemName,
        itemType,
        timestamp: new Date().toISOString(),
        Name: `${action} ${itemName}`
      };
      
      return await this.createActivities([activity]);
    } catch (error) {
      console.error("Error logging activity:", error);
      throw error;
    }
  }
}

export default new ActivityService();