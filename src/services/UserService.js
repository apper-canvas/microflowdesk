class UserService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'User4';
    // All fields for User4 table
    this.allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'email', 'avatar', 'isOnline', 'lastSeen', 'role'];
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'email', 'avatar', 'isOnline', 'lastSeen', 'role'];
  }

  async fetchUsers(filters = {}) {
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
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const params = {
        fields: this.allFields
      };

      const response = await this.apperClient.getRecordById(this.tableName, userId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  }

  async createUsers(users) {
    try {
      // Filter data to only include updateable fields
      const filteredUsers = users.map(user => {
        const filteredUser = {};
        this.updateableFields.forEach(field => {
          if (user[field] !== undefined) {
            // Handle data type formatting
            if (field === 'isOnline' && typeof user[field] !== 'boolean') {
              filteredUser[field] = Boolean(user[field]);
            } else if (field === 'Tags' && Array.isArray(user[field])) {
              filteredUser[field] = user[field].join(',');
            } else {
              filteredUser[field] = user[field];
            }
          }
        });
        return filteredUser;
      });

      const params = {
        records: filteredUsers
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        console.log(`Created ${successfulRecords.length} users successfully`);
        if (failedRecords.length > 0) {
          console.warn(`Failed to create ${failedRecords.length} users`);
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
        console.error("Bulk user creation failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error creating users:", error);
      throw error;
    }
  }

  async updateUsers(users) {
    try {
      // Filter data to only include updateable fields (plus Id)
      const filteredUsers = users.map(user => {
        const filteredUser = { Id: user.Id };
        this.updateableFields.forEach(field => {
          if (user[field] !== undefined) {
            // Handle data type formatting
            if (field === 'isOnline' && typeof user[field] !== 'boolean') {
              filteredUser[field] = Boolean(user[field]);
            } else if (field === 'Tags' && Array.isArray(user[field])) {
              filteredUser[field] = user[field].join(',');
            } else {
              filteredUser[field] = user[field];
            }
          }
        });
        return filteredUser;
      });

      const params = {
        records: filteredUsers
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        console.log(`Updated ${successfulUpdates.length} users successfully`);
        if (failedUpdates.length > 0) {
          console.warn(`Failed to update ${failedUpdates.length} users`);
          failedUpdates.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        console.error("Bulk user update failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error updating users:", error);
      throw error;
    }
  }

  async deleteUsers(userIds) {
    try {
      const params = {
        RecordIds: userIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        console.log(`Deleted ${successfulDeletions.length} users successfully`);
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} users`);
          failedDeletions.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return true;
      } else {
        console.error("Bulk user deletion failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      throw error;
    }
  }

  async searchUsers(query) {
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
      return await this.fetchUsers(filters);
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }
}

export default new UserService();